# Stage 1: Build environment with all tools
FROM node:20-bullseye AS installer
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    gcc \
    g++ \
    # docker.io \
    curl \
    zip \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Java and Kotlin
COPY --from=openjdk:17-jdk-alpine /opt/openjdk-17 /usr/java/openjdk-17
ENV JAVA_HOME=/usr/java/openjdk-17
ENV PATH="${JAVA_HOME}/bin:${PATH}"

RUN curl -s https://get.sdkman.io | bash \
    && bash -c "source $HOME/.sdkman/bin/sdkman-init.sh && sdk install kotlin"

# Install ALL dependencies (including dev)
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Production runtime (OPTIMIZED)
FROM node:20-bullseye AS release
WORKDIR /app

# Install ONLY runtime system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    gcc \
    g++ \
    # docker.io \
    && rm -rf /var/lib/apt/lists/*

# Copy Java runtime (smaller than full JDK)
COPY --from=openjdk:17-jdk-alpine /opt/openjdk-17 /usr/java/openjdk-17
ENV JAVA_HOME=/usr/java/openjdk-17
ENV PATH="${JAVA_HOME}/bin:${PATH}"

# Copy only Kotlin runtime
COPY --from=installer /root/.sdkman/candidates/kotlin /usr/local/kotlin
ENV PATH="/usr/local/kotlin/bin:${PATH}"

# Install ONLY production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy ONLY built files and runtime necessities
COPY --from=installer /app/.next ./.next
COPY --from=installer /app/public ./public
COPY --from=installer /app/prisma/schema.prisma ./prisma/
COPY --from=installer /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=installer /app/run.sh ./

# Fix line endings and permissions
RUN sed -i 's/\r$//' run.sh && chmod +x run.sh

# Configuration
EXPOSE 3000
ENV NODE_ENV=production

CMD ["./run.sh"]