# Self-contained Litecoin Core node manager and web UI.
# Fetch the official release archives by their independently published SHA-256
# so the daemon can advance even when the third-party container image lags.
FROM debian:bookworm-slim AS litecoind
ARG TARGETARCH
ARG LITECOIN_VERSION=0.21.5.6
RUN apt-get update \
 && apt-get install --no-install-recommends --yes ca-certificates curl \
 && rm -rf /var/lib/apt/lists/* \
 && case "$TARGETARCH" in \
      amd64) archive="litecoin-${LITECOIN_VERSION}-x86_64-linux-gnu.tar.gz"; expected_sha256="3c0a217651a431ef446641669a0b74ce7dbcd9b9ed1a118fc830b8f6779ee83f" ;; \
      arm64) archive="litecoin-${LITECOIN_VERSION}-aarch64-linux-gnu.tar.gz"; expected_sha256="81c3ca2a7fcbccaabaf0a0ea2022f1990787f0cc1937aaad4dcc61d2856799a8" ;; \
      *) echo "Unsupported target architecture: $TARGETARCH" >&2; exit 1 ;; \
    esac \
 && curl --fail --location --retry 3 --output "/tmp/$archive" "https://github.com/litecoin-project/litecoin/releases/download/v${LITECOIN_VERSION}/$archive" \
 && echo "$expected_sha256  /tmp/$archive" | sha256sum --check --strict \
 && mkdir -p /opt \
 && tar --extract --gzip --file "/tmp/$archive" --directory /opt \
 && rm "/tmp/$archive"

FROM node:24.19.0-slim@sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03 AS deps
WORKDIR /repo
COPY package*.json ./
COPY apps/backend/package*.json apps/backend/
COPY apps/ui/package*.json apps/ui/
RUN npm ci --workspaces --include-workspace-root --install-strategy=hoisted
ENV PATH="/repo/node_modules/.bin:$PATH"

FROM deps AS app-builder
WORKDIR /repo
COPY . .
RUN tsc -b libs/shared-types libs/settings apps/backend \
 && npm run --workspace apps/ui build

FROM node:24.19.0-slim@sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03 AS runtime
WORKDIR /app
COPY package*.json ./
COPY apps/backend/package*.json apps/backend/
RUN npm ci --workspace apps/backend --include-workspace-root --omit=dev --omit=optional --install-strategy=hoisted --ignore-scripts
COPY --from=app-builder /repo/apps/backend/dist ./dist
COPY --from=app-builder /repo/apps/ui/dist ./dist/public
COPY --from=app-builder /repo/libs/settings/dist ./libs/settings/dist
COPY --from=app-builder /repo/libs/shared-types/dist ./libs/shared-types/dist

# Keep the UI's version-manager contract while using the pinned official Litecoin Core binary.
RUN mkdir -p /opt/litecoind/v0.21.5.6 /data/litecoin /data/app
COPY --from=litecoind /opt/litecoin-0.21.5.6/bin/litecoind /opt/litecoind/v0.21.5.6/litecoind
COPY --from=litecoind /opt/litecoin-0.21.5.6/bin/litecoin-cli /opt/litecoind/v0.21.5.6/litecoin-cli
RUN ln -sfn /opt/litecoind/v0.21.5.6 /opt/litecoind/current \
 && ln -sfn /opt/litecoind/current/litecoind /usr/local/bin/litecoind \
 && ln -sfn /opt/litecoind/current/litecoin-cli /usr/local/bin/litecoin-cli \
 && ln -sfn /data/litecoin /root/.litecoin \
 && mkdir -p /home/node \
 && ln -sfn /data/litecoin /home/node/.litecoin \
 && chown -R 1000:1000 /opt/litecoind /data /home/node

ENV NODE_ENV=production
ENV LITECOIN_DIR=/data/litecoin
ENV APP_STATE_DIR=/data/app
# Safe standalone defaults; the Umbrel package provides the same values explicitly.
ENV LITECOIND_IP=0.0.0.0 \
    RPC_PORT=9332 \
    P2P_PORT=9333 \
    TOR_PORT=9334 \
    TOR_HOST=127.0.0.1 \
    TOR_SOCKS_PORT=9050 \
    TOR_CONTROL_PORT=9051 \
    TOR_CONTROL_PASSWORD=change-me \
    ZMQ_RAWBLOCK_PORT=29332 \
    ZMQ_RAWTX_PORT=29333 \
    ZMQ_HASHBLOCK_PORT=29334 \
    ZMQ_SEQUENCE_PORT=29335 \
    ZMQ_HASHTX_PORT=29336
EXPOSE 3000 9332 9333
VOLUME /data
USER 1000:1000
CMD ["node", "dist/server.js"]
