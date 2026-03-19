def divide_cats(cat1: dict, cat2: dict) -> dict:
    """Divide cat attributes by dividing numeric values and combining string attributes."""
    return {
        "name": f"{cat1.get('name', '')}-{cat2.get('name', '')}",
        "age": cat1.get('age', 0) / cat2.get('age', 1) if cat2.get('age', 1) != 0 else 0,
        "weight": cat1.get('weight', 0) / cat2.get('weight', 1) if cat2.get('weight', 1) != 0 else 0,
        "breed": f"{cat1.get('breed', '')}/{cat2.get('breed', '')}"
    }