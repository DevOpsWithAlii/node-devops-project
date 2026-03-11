# Node DevOps Project

This project demonstrates containerizing a Node.js application using Docker and Docker Compose with MongoDB and Redis.

## Technologies

Node.js  
Docker  
Docker Compose  
MongoDB  
Redis  

## Project Structure

- app.js  
- package.json  
- Dockerfile
- multi-stage
- docker-compose.yml  
- .env  

## Setup Instructions

Clone repository:--

git clone <repo-url>

Go into project:--

cd node-devops-project

Run application:--

docker compose up --build

Start the MongoDB shell:--
[mongosh]

## Access Application

http://localhost:8090

## Health Check

http://localhost:8090/health
