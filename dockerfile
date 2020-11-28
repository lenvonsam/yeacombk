FROM node:8.11-alpine
# RUN apk update && apk upgrade && apk add git
RUN npm config set registry https://registry.npm.taobao.org
# RUN git config --global user.email "yanjuncr@sina.com"
# RUN git config --global user.name "samy"
#RUN pwd
#RUN git clone https://github.com/lenvonsam/crm-client.git
#ADD ./crm-client /crm-client

WORKDIR /yeacombk
#RUN pwd
#RUN ls -la
#RUN git pull
#RUN git checkout stage
#RUN git pull origin stage
#RUN rm -rf package-lock.json && npm install
EXPOSE 6686
CMD [ "npm", "run", "docker" ]