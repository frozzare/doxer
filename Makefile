docs:
	rm doxer.js;
	wget https://github.com/Frozzare/doxer/raw/master/lib/doxer.js;
	doxer -t Doxer doxer.js;
	mv docs/* .;
	rm -r docs index.html;
	mv doxer.html index.html;

.PHONY: docs