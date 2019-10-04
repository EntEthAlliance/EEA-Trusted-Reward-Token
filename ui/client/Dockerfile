FROM node:10-jessie as build

# install and cache app dependencies
COPY package*.json /build/

WORKDIR /build

RUN ls && \
    npm install -g @angular/cli && \
    npm install

# add app
COPY . /build/

RUN ls && npm run build

FROM nginx:alpine

COPY --from=build /build/dist/client /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]