FROM node:14.3

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY .env ./
COPY .npmrc ./

ARG NODE_HEAP_MEMORY \
  DD_PROFILING_ENABLED

ENV NODE_OPTIONS=--max-old-space-size=$NODE_HEAP_MEMORY \
  DD_PROFILING_ENABLED=$DD_PROFILING_ENABLED \
  DD_CHECKS_TAG_CARDINALITY=$DD_CHECKS_TAG_CARDINALITY

#RUN npm install -g yarn
#RUN yarn
RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

#port
EXPOSE 9006
CMD [ "node", "src/server.js" ]
