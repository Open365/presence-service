#############################################################
# DOCKERFILE FOR PRESENCE SERVICE
#############################################################
# DEPENDENCIES
# * NodeJS (provided)
#############################################################
# BUILD FLOW
# 3. Copy the service to the docker at /var/service
# 4. Run the default installation
# 5. Add the docker-startup.sh file which knows how to start
#    the service
#############################################################

FROM docker-registry.eyeosbcn.com/eyeos-fedora21-node-base

ENV InstallationDir /var/service/
ENV WHATAMI presenceService

WORKDIR ${InstallationDir}

CMD eyeos-run-server --serf /var/service/src/eyeos-presence-service.js

RUN mkdir -p ${InstallationDir}/src/ && touch ${InstallationDir}src/presence-service-installed.js

COPY . ${InstallationDir}

RUN npm install --verbose && \
    npm cache clean
