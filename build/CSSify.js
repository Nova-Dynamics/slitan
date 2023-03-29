const fs = require('fs');
const path = require('path');
const resolveFrom = require('resolve-from');

class CSSify
{

    start(entrypoint)
    {
        this.checked
        this.css_files = []
        this.recurse_enter(entrypoint)

        return this.css_files
    }

    recurse_enter(file_path) {

        const file = fs.readFileSync(file_path, 'utf8');

        // Parse out all requires that reference a .css file and add them to the css_files list if they haven't already been added
        const css_requires = file.match(/require\(['"](.+?\.css)['"]\)/g);
        if (css_requires) {
            css_requires.forEach(css_require => {
                const css_path = css_require.match(/require\(['"](.+?\.css)['"]\)/)[1];
                const resolved_css_path = path.resolve(path.dirname(file_path), css_path);
                if (!this.css_files.includes(resolved_css_path)) {
                    this.css_files.push(resolved_css_path);
                }
            });
        }

        // Parse out all requires that reference a local or non-local file
        const local_requires = file.match(/require\(['"](.+?)['"]\)/g);
        if (local_requires) {
            local_requires.forEach(local_require => {

                const local_path = local_require.match(/require\(['"](.+?)['"]\)/)[1];

                let resolved_local_path = "";

                try {
                    resolved_local_path = resolveFrom(path.dirname(file_path), local_path);
                } catch (error) {}
                

                const is_local = !resolved_local_path.includes('node_modules') && fs.existsSync(resolved_local_path);
                const is_slitan = resolved_local_path.includes('slitan');
                if ((is_local || is_slitan) && !resolved_local_path.endsWith('.css')) {
                    this.recurse_enter(resolved_local_path);
                }
            });
        }
    }

    bundle(out_dir) {
        const css_contents = this.css_files.map(css_path => fs.readFileSync(css_path, 'utf8')).join('\n');
        fs.writeFileSync(path.join(out_dir, 'bundle.css'), css_contents);
    }
    
}

module.exports = CSSify;