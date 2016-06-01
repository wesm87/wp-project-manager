<?php

echo "Handling theme setup...\n";

chdir( './htdocs/web/app/themes/blr-base-theme/' );
print( 'Installing Node Modules for blr-base-theme' . PHP_EOL );
passthru( 'npm i' );
print( 'Installing Bower Packages for blr-base-theme' . PHP_EOL );
passthru( 'bower i' );
chdir( '../training-today' );
print( 'Installing Node Modules for the child theme' . PHP_EOL );
passthru( 'npm i' );
print( 'Installing Bower Packages for the child theme' . PHP_EOL );
passthru( 'bower i' );
print( 'Compiling assets using gulp build...' . PHP_EOL );
passthru( 'node_modules/.bin/gulp' );
print( 'BLR Base Theme and the child theme have been prepared. Happy hacking.' . PHP_EOL );
