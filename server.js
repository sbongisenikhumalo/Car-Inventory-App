// Import required packages
const express = require("express");
const fs = require("fs"); // For reading and writing to the JSON file
const bodyParser = require("body-parser"); // To parse JSON body data
const cors = require("cors"); // To allow cross-origin requests

// Create an instance of an Express app
const app = express();

// Define the port the server will run on
const PORT = process.env.PORT || 3001;

// Define the path to the JSON file
const filePath = "cars.json";

// Enable CORS so frontend can talk to the backend
app.use(cors());

// Parse JSON data in requests
app.use(bodyParser.json());

// Get all cars from the file
function getCars() {
  try {
    const data = fs.readFileSync(filePath); // Read cars.json
    return JSON.parse(data); // Convert JSON string to JS object
  } catch {
    // If file doesn't exist or there's an error, create an empty array
    fs.writeFileSync(filePath, "[]");
    return [];
  }
}

// Save cars to the file
function saveCars(cars) {
  fs.writeFileSync(filePath, JSON.stringify(cars, null, 2)); // Save with formatting
}

// Routes

// GET /cars - Return all cars
app.get("/cars", (req, res) => {
  const cars = getCars(); // Get car list
  res.json(cars); // Send car list to client
});

// POST /cars - Add a new car
app.post("/cars", (req, res) => {
  const cars = getCars(); // Get current cars
  const newCar = {
    id: Date.now().toString(), // Generate a unique ID using timestamp
    make: req.body.make, // Get make from request body
    model: req.body.model, // Get model
    year: req.body.year, // Get year
  };
  cars.push(newCar); // Add new car to the list
  saveCars(cars); // Save updated list
  res.json(newCar); // Respond with the new car
});

// PUT /cars/:id - Update an existing car
app.put("/cars/:id", (req, res) => {
  const cars = getCars();
  const index = cars.findIndex((car) => car.id === req.params.id); // Find car by ID
  if (index !== -1) {
    cars[index] = { ...cars[index], ...req.body }; // Update car details
    saveCars(cars);
    res.json(cars[index]); // Respond with updated car
  } else {
    res.status(404).send("Car not found"); // If not found, send 404
  }
});

// DELETE /cars/:id - Delete a car
app.delete("/cars/:id", (req, res) => {
  const cars = getCars();
  const filtered = cars.filter((car) => car.id !== req.params.id); // Remove car by ID
  saveCars(filtered);
  res.json({ message: "Deleted" }); // Send confirmation
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚗 Cars API running on port ${PORT}`);
});
