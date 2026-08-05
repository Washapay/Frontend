#!/bin/sh
API_URL="${VITE_API_PROXY_URL:-http://localhost:8080}"

sed -i "s|</head>|<script>window.API_URL = '${API_URL}';</script></head>|" /usr/share/nginx/html/index.html

exec "$@"
