# Stage 1: Build environment with all tools
# FROM node:20-bullseye AS installer
# WORKDIR /app

# # Install build dependencies
# RUN apt-get update && apt-get install -y \
#     python3 \
#     gcc \
#     g++ \
#     # docker.io \
#     curl \
#     zip \
#     unzip \
#     && rm -rf /var/lib/apt/lists/*

# # Install Java and Kotlin
# COPY --from=openjdk:17-jdk-alpine /opt/openjdk-17 /usr/java/openjdk-17
# ENV JAVA_HOME=/usr/java/openjdk-17
# ENV PATH="${JAVA_HOME}/bin:${PATH}"

# RUN curl -s https://get.sdkman.io | bash \
#     && bash -c "source $HOME/.sdkman/bin/sdkman-init.sh && sdk install kotlin"

# # Install ALL dependencies (including dev)
# COPY package*.json ./
# RUN npm install

# # Copy source and build
# COPY . .
# RUN npx prisma generate
# RUN npm run build

# Production runtime with pre-built files
FROM node:20-bullseye as release
WORKDIR /app

# Install system dependencies (Python, GCC, G++)
RUN apt-get update && apt-get install -y \
    python3 \
    gcc \
    g++ \
    curl \
    zip \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Java 17
COPY --from=openjdk:17-jdk-alpine /opt/openjdk-17 /usr/java/openjdk-17
ENV JAVA_HOME=/usr/java/openjdk-17
ENV PATH="${JAVA_HOME}/bin:${PATH}"

# Install Kotlin
RUN curl -s https://get.sdkman.io | bash \
    && bash -c "source $HOME/.sdkman/bin/sdkman-init.sh && sdk install kotlin" \
    && cp -r $HOME/.sdkman/candidates/kotlin/current/* /usr/local/ \
    && rm -rf $HOME/.sdkman
ENV PATH="/usr/local/bin:${PATH}"

# Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy pre-built Next.js files (build these locally first!)
COPY .next ./.next
COPY public ./public

# Copy Prisma schema and generate client
COPY prisma/schema.prisma ./prisma/
RUN npx prisma generate

# Copy your run script
COPY run.sh ./
RUN sed -i 's/\r$//' run.sh && chmod +x run.sh

# Configuration
EXPOSE 3000
ENV NODE_ENV=production

CMD ["./run.sh"]