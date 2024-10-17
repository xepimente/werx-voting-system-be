FROM node:16-alpine AS builder
# Create new app directory
RUN mkdir app
# Set the working directory
WORKDIR /app
# Copy the package.json and package-lock.json files
COPY package*.json ./
# Install the dependencies
RUN npm install --legacy-peer-deps
# Copy the app files
COPY . .
# Build the app
# RUN npm run build
# Expose the port
EXPOSE 4005
# Run the app
CMD ["npm", "run", "dev"]