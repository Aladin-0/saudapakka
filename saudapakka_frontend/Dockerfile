# 1. Use the standard Node image (Not slim) for better compatibility
FROM node:22

# 2. Set working directory
WORKDIR /app

# 3. Copy package files
COPY package.json package-lock.json* ./

# 4. Install dependencies
# We use 'npm ci' if a lockfile exists for a clean install, otherwise 'npm install'
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# 5. Copy the rest of the code
COPY . .

# 6. Expose the port
EXPOSE 3000

# 7. Start the dev server
CMD ["npm", "run", "dev"]