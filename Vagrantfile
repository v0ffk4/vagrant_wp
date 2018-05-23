Vagrant.configure("2") do |config|
	config.vm.box = "bento/debian-9.3"
	# config.vm.box_version = " 9.3.0"
	config.vm.hostname = "DEV-DEBIAN"
# Make folder group writable
	config.vm.synced_folder ".", "/vagrant", :mount_options => ["dmode=777","fmode=666"]
## Create name
	config.vm.define "SGTOURS_INT"
	config.vm.provider :virtualbox do |vb|
		vb.name = "APPNAME"
	end

## provision
	config.vm.provision "shell", path: "provision.sh"
	config.vm.provision "shell", path: "guestStart.sh", run: "always", privileged: false

## network
	config.vm.network :forwarded_port, guest: 80, host: 8080
# website address is here
	config.vm.network :private_network, ip: "192.168.68.250"
end