def multiply_cats(cat1: dict, cat2: dict) -> dict:
    """Combine two cats by multiplying their attributes."""
    return {
        'name': f"{cat1['name']}-{cat2['name']}",
        'age': cat1['age'] * cat2['age'],
        'weight': cat1['weight'] * cat2['weight'],
        'breed': f"{cat1['breed']}/{cat2['breed']}"
    }