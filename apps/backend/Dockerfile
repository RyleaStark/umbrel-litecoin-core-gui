# Self-contained Litecoin Core node manager and web UI.
# The Litecoin daemon is copied from the official multi-architecture image.
FROM litecoinproject/litecoin-core:0.21.5.5@sha256:d541077a067257620648371ab88cc1fb7eb3b738ad3fc8981d75008a73df3561 AS litecoind

FROM node:20-slim AS deps
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

FROM node:20-slim AS runtime
WORKDIR /app
COPY package*.json ./
COPY apps/backend/package*.json apps/backend/
RUN npm ci --omit=dev --install-strategy=hoisted --ignore-scripts
COPY --from=app-builder /repo/apps/backend/dist ./dist
COPY --from=app-builder /repo/apps/ui/dist ./dist/public
COPY --from=app-builder /repo/libs/settings/dist ./libs/settings/dist
COPY --from=app-builder /repo/libs/shared-types/dist ./libs/shared-types/dist

# Keep the UI's version-manager contract while using the pinned official Litecoin Core binary.
RUN mkdir -p /opt/litecoind/v0.21.5.5 /data/litecoin /data/app
COPY --from=litecoind /opt/litecoin-0.21.5.5/bin/litecoind /opt/litecoind/v0.21.5.5/litecoind
COPY --from=litecoind /opt/litecoin-0.21.5.5/bin/litecoin-cli /opt/litecoind/v0.21.5.5/litecoin-cli
RUN ln -sfn /opt/litecoind/v0.21.5.5 /opt/litecoind/current \
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
