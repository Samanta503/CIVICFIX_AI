#!/usr/bin/env bash
set -e

PORT_VALUE="${PORT:-10000}"

sed -i "s/Listen 80/Listen ${PORT_VALUE}/g" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:80>/<VirtualHost *:${PORT_VALUE}>/g" /etc/apache2/sites-available/000-default.conf

mkdir -p storage/app/public storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

php artisan optimize:clear

php artisan migrate --force

if [ "${RUN_SEEDER_ON_BOOT}" = "true" ]; then
  php artisan db:seed --force
fi

php artisan storage:link || true

php artisan config:cache
php artisan view:cache

apache2-foreground