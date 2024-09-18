# Use the Node 20 Alpine base image
FROM node:20

# Install dependencies
RUN apt-get update && apt-get install -y \
    x11-utils \
    xvfb \
    libnss3 \
    libatk-bridge2.0-0 \
    libxkbcommon-x11-0 \
    libgtk-3-0 \
    libasound2 \
    libxcomposite1 \
    libxrandr2 \
    libgbm1 \
    libpango1.0-0 \
    libxcb-shm0 \
    libxcb1 \
    libxcb-dri3-0 \
    && apt-get clean

# Create a directory for the app
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Playwright and required browsers
RUN npx playwright install --with-deps chromium
RUN npx playwright install --with-deps firefox
RUN npx playwright install --with-deps chrome

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 3004

# Set environment variables for display
ENV DISPLAY=:99

# Make envioriment variable permanent 
RUN echo "export DISPLAY=:99" >> /etc/profile

# Run Xvfb display and then the script
CMD ["sh", "-c", "rm -rf /tmp/.X99-lock && Xvfb :99 -screen 0 1024x768x24 -ac +extension GLX +render -noreset & npm run start"]

