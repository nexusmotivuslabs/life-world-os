"""
Constraint registry.

To add a new constraint:
  1. Create apps/rie-backend/constraints/<name>.py with a class extending BaseConstraint
  2. Import it here and add an entry to CONSTRAINT_REGISTRY

The registry maps constraint ID → class (not instance), so each request
gets a fresh resolution with current data.
"""
from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from constraints.base import BaseConstraint

# Lazy imports to avoid circular dependencies at module load time
def _get_registry() -> dict[str, type]:
    from constraints.physical import PhysicalConstraint
    from constraints.biological import BiologicalConstraint
    from constraints.economic import EconomicConstraint
    from constraints.informational import InformationalConstraint
    from constraints.social import SocialConstraint

    return {
        "physical": PhysicalConstraint,
        "biological": BiologicalConstraint,
        "economic": EconomicConstraint,
        "informational": InformationalConstraint,
        "social": SocialConstraint,
    }


def get_constraint(constraint_id: str) -> "BaseConstraint":
    registry = _get_registry()
    cls = registry.get(constraint_id)
    if cls is None:
        raise KeyError(f"Unknown constraint: '{constraint_id}'. Available: {list(registry.keys())}")
    return cls()


def all_constraint_ids() -> list[str]:
    return list(_get_registry().keys())
