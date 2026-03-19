class Bird:
    def __init__(self, name, species, color, can_fly=True):
        """
        Initialize a Bird instance.
        
        Args:
            name (str): The name of the bird
            species (str): The species of the bird
            color (str): The color of the bird
            can_fly (bool): Whether the bird can fly (default: True)
        """
        self.name = name
        self.species = species
        self.color = color
        self.can_fly = can_fly
        self.energy = 100
    
    def fly(self):
        """Simulate the bird flying if it can fly."""
        if self.can_fly and self.energy >= 10:
            self.energy -= 10
            return f"{self.name} is flying!"
        elif not self.can_fly:
            return f"{self.name} cannot fly."
        else:
            return f"{self.name} is too tired to fly."
    
    def eat(self, food="seeds"):
        """Simulate the bird eating to regain energy."""
        self.energy = min(100, self.energy + 20)
        return f"{self.name} ate {food} and regained energy!"
    
    def sing(self):
        """Simulate the bird singing."""
        return f"{self.name} is singing!"
    
    def __str__(self):
        """String representation of the bird."""
        return f"{self.name} ({self.species}) - Color: {self.color}, Energy: {self.energy}"