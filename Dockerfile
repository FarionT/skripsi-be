### STAGE 1: Build app ###
FROM node:22-alpine AS deps
LABEL maintainer "info@concise.co.id"

WORKDIR /app
# Add the package list to app dir
COPY package*.json .
# Install all the dependencies
RUN npm install

### STAGE 2: Build app ###
FROM deps AS builder

WORKDIR /builder

COPY --from=deps /app /builder
COPY . .
RUN npm run build

### STAGE 3: Serve app ###
FROM node:22-alpine

WORKDIR /app
# Add the node modules to app dir
COPY --from=deps /app .
# Add the source code to app dir
COPY --from=builder /builder/build .

# Run app
CMD [ "node", "index.js" ]

# Expose port 15555
EXPOSE 15555
