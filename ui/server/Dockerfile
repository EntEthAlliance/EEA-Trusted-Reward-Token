FROM node:10-jessie as build

# install and cache app dependencies
COPY package*.json /build/

WORKDIR /build

RUN ls && \
    npm install

# add app
COPY . /build/

RUN ls && npm run build

EXPOSE 9000

CMD ["npm", "run", "prod"]