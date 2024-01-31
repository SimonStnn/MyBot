FROM node:18.18

WORKDIR /app

# Copy the application
COPY . .

# Install dependencies
RUN npm install
RUN npm install -g typescript

RUN tsc

CMD [ "npm", "run", "start" ]