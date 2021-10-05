echo "Building css"
echo "Bundling bootstrap"
cat node_modules/bootstrap/dist/css/bootstrap.min.css > webapp/public/bundle.css


echo "Bundling streamplot"
echo "\n" >> webapp/public/bundle.css
echo "/* " >> webapp/public/bundle.css
echo " * ================================== " >> webapp/public/bundle.css
echo " *  CSS from: streamplot " >> webapp/public/bundle.css
echo " * ==================================" >> webapp/public/bundle.css
echo " */" >> webapp/public/bundle.css
cat webapp/lib/streamplot/styles.css >> webapp/public/bundle.css

for f in webapp/css/*.css
do
  echo "Bundling $f"
  echo "\n" >> webapp/public/bundle.css
  echo "/* " >> webapp/public/bundle.css
  echo " * ================================== " >> webapp/public/bundle.css
  echo " *  CSS from: $f " >> webapp/public/bundle.css
  echo " * ==================================" >> webapp/public/bundle.css
  echo " */" >> webapp/public/bundle.css
  cat $f >> webapp/public/bundle.css
done
echo "Done with css"
