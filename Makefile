docs:
	sudo rm -r doxer;
	git clone git://github.com/Frozzare/doxer.git;
	doxer -d . doxer/lib/*
	rm -r index.html;
	cp doxer.html index.html;

.PHONY: docs