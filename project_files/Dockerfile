FROM node:20-alpine

WORKDIR /app/Frontend

# Copy package files and install dependencies
COPY Frontend/package*.json ./
RUN npm install

# Copy the rest of your code
COPY Frontend/ .

EXPOSE 3000

# Start React in development mode
CMD ["npm", "start"]