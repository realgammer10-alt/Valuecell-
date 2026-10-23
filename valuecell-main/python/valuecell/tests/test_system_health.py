"""Tests for system health reporting."""

import asyncio
from types import SimpleNamespace

import pytest
from fastapi.routing import APIRoute
from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError

from valuecell.server.api.routers import system


def _health_endpoint():
    router = system.create_system_router()
    route = next(
        route
        for route in router.routes
        if isinstance(route, APIRoute) and route.path == "/system/health"
    )
    return route.endpoint


def test_health_reports_healthy_api_and_database(monkeypatch):
    engine = create_engine("sqlite:///:memory:")
    monkeypatch.setattr(
        system, "get_settings", lambda: SimpleNamespace(APP_VERSION="test")
    )
    monkeypatch.setattr(system, "get_engine", lambda: engine)

    try:
        response = asyncio.run(_health_endpoint()())
    finally:
        engine.dispose()

    assert response.data.status == "healthy"
    assert response.data.version == "test"
    assert response.data.checks == {"api": "healthy", "database": "healthy"}
    assert response.data.timestamp.tzinfo is not None


@pytest.mark.parametrize(
    "error", [SQLAlchemyError("database unavailable"), OSError("connection failed"), TimeoutError("connection timed out")]
)
def test_health_reports_degraded_when_database_is_unavailable(monkeypatch, error):
    monkeypatch.setattr(
        system, "get_settings", lambda: SimpleNamespace(APP_VERSION="test")
    )

    def raise_database_error():
        raise error

    monkeypatch.setattr(system, "get_engine", raise_database_error)

    response = asyncio.run(_health_endpoint()())

    assert response.data.status == "degraded"
    assert response.data.checks == {"api": "healthy", "database": "unhealthy"}
