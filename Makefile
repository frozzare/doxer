docs:
	doxer -t Doxer doxer.js;
	mv docs/* .;
	rm -r docs index.html;
	mv doxer.html index.html;

.PHONY: docs