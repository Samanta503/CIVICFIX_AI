FROM php:8.3-apache

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    zip \
    libzip-dev \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    default-mysql-client \
    && docker-php-ext-install pdo_mysql mbstring zip exif pcntl bcmath gd

RUN a2enmod rewrite

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . /var/www/html

COPY docker/000-default.conf /etc/apache2/sites-available/000-default.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN composer install --no-dev --optimize-autoloader

RUN mkdir -p storage/app/public storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 10000

CMD ["/usr/local/bin/entrypoint.sh"]