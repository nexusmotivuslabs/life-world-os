"""
Tests for Constraints of Life API: valid ids and per-constraint endpoint.
"""
import pytest
from fastapi.testclient import TestClient

from main import app
from constraints.registry import all_constraint_ids, get_constraint

client = TestClient(app)

EXPECTED_CONSTRAINT_IDS = ["physical", "biological", "economic", "informational", "social"]


class TestConstraintRegistry:
    """The five constraints of life are the only registered areas."""

    def test_all_constraint_ids_are_five_constraints_of_life(self):
        ids = all_constraint_ids()
        assert ids == EXPECTED_CONSTRAINT_IDS

    def test_get_constraint_returns_instance_for_valid_id(self):
        for cid in EXPECTED_CONSTRAINT_IDS:
            c = get_constraint(cid)
            assert c.id == cid
            assert c.name and isinstance(c.name, str)
            assert c.layer in (1, 2, 3, 4, 5)

    def test_get_constraint_raises_for_unknown_id(self):
        with pytest.raises(KeyError, match="Unknown constraint"):
            get_constraint("unknown")


class TestConstraintEndpoint:
    """GET /api/constraints/{constraint_id}."""

    def test_unknown_constraint_id_returns_404(self):
        response = client.get("/api/constraints/not-a-constraint")
        assert response.status_code == 404
        assert "Unknown constraint" in response.json().get("detail", "")

    def test_valid_constraint_ids_are_accepted(self):
        """Each valid id returns 200 or 502 (502 if resolve fails e.g. missing API key)."""
        for cid in EXPECTED_CONSTRAINT_IDS:
            response = client.get(f"/api/constraints/{cid}")
            assert response.status_code in (200, 502), f"Unexpected status for {cid}: {response.status_code}"
            if response.status_code == 200:
                data = response.json()
                assert data["id"] == cid
                assert "name" in data
                assert data["layer"] in (1, 2, 3, 4, 5)
                assert "metrics" in data
                assert "thesis" in data
