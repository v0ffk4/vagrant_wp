# Variables
SYSTEMUSER="www-data"
DBHOST="localhost"
DBNAME="DB_NAME_HERE"
DBUSER="DB_USER_HERE"
DBPASSWD="DB_PASSWORD_HERE"
DBROOTPASSWD="DB_ROOT_PASSWORD_HERE"

## Add systemuser to vagrant group
usermod -a -G vagrant $SYSTEMUSER

## This makes debconf use a frontend that expects no interactive input at all
export DEBIAN_FRONTEND=noninteractive

## Update packages
echo -e "\n--- Updating packages ---\n"
apt-get -y update
apt-get -y upgrade

## Install apache
echo -e "\n--- Installing Apache2 ---\n" >> /vagrant/vm_build.log 2>&1
apt-get -y install apache2
systemctl start apache2
## Configure Apache
echo -e "\n--- Configuring Apache2 ---\n" >> /vagrant/vm_build.log 2>&1
rm -rf /etc/apache2/sites-available
ln -s /vagrant/config-apache2/sites-available /etc/apache2/sites-available
rm -rf /etc/apache2/apache2.conf
ln -s /vagrant/config-apache2/apache2.conf /etc/apache2/apache2.conf
# clean /var/www
sudo rm -Rf /var/www
# symlink /var/www => /vagrant/www
ln -s /vagrant/www /var/www
# Enable mode rewrite
a2enmod rewrite

# ## Install MariaDB
# echo -e "\n--- Installing MariaDB ---\n"
debconf-set-selections <<< "mysql-server mysql-server/root_password password $DBROOTPASSWD"
debconf-set-selections <<< "mysql-server mysql-server/root_password_again password $DBROOTPASSWD"
debconf-set-selections <<< "phpmyadmin phpmyadmin/dbconfig-install boolean true"
debconf-set-selections <<< "phpmyadmin phpmyadmin/app-password-confirm password $DBROOTPASSWD"
debconf-set-selections <<< "phpmyadmin phpmyadmin/mysql/admin-pass password $DBROOTPASSWD"
debconf-set-selections <<< "phpmyadmin phpmyadmin/mysql/app-pass password $DBROOTPASSWD"
debconf-set-selections <<< "phpmyadmin phpmyadmin/reconfigure-webserver multiselect none"
apt-get install -y mariadb-server phpmyadmin

# Start Maria DB
systemctl start mariadb.service

# Secure MariaDB
echo -e "\n--- Securing MariaDB ---\n"
mysql_secure_installation <<EOF
$DBROOTPASSWD
n
y
y
y
y
EOF

# Setup new database
echo -e "\n--- Setting up the database ---\n"
mysql -uroot -p$DBROOTPASSWD -e "CREATE DATABASE $DBNAME"
mysql -uroot -p$DBROOTPASSWD -e "grant all privileges on $DBNAME.* to '$DBUSER'@'localhost' identified by '$DBPASSWD'"

# install xsl
apt-get -y install php7.0-xsl

# Starting services
echo -e "\n--- Starting services ---\n"
# start apache2
echo -e "\n--- Starting Apache ---\n"
systemctl restart apache2
systemctl enable apache2
# start MariaDB
echo -e "\n--- Starting MariaDB ---\n"
systemctl restart mariadb.service
systemctl enable mariadb.service
