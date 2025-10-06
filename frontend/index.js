!function(){if(!window.UnicornStudio){window.UnicornStudio={isInitialized:!1};var i=document.createElement("script");i.src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.30/dist/unicornStudio.umd.js",i.onload=function(){window.UnicornStudio.isInitialized||(UnicornStudio.init(),window.UnicornStudio.isInitialized=!0)},(document.head || document.body).appendChild(i)}}();
    
    // Drag and Drop Functionality
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const codeInput = document.getElementById('codeInput');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    dropArea.addEventListener('drop', handleDrop, false);
    fileInput.addEventListener('change', handleFiles, false);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        dropArea.classList.add('drag-over');
    }

    function unhighlight() {
        dropArea.classList.remove('drag-over');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles({ target: { files } });
    }

    function handleFiles(e) {
        const files = e.target.files;
        if (files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                codeInput.value = e.target.result;
                dropArea.style.borderColor = '#10b981';
                dropArea.querySelector('.drop-text').textContent = `✓ ${file.name} loaded`;
                dropArea.querySelector('.drop-subtext').textContent = 'Ready to generate README';
            };
            
            reader.readAsText(file);
        }
    }

    async function generateReadme() {
        const code = codeInput.value.trim();
        const btn = document.getElementById('generateBtn');
    
        if (!code) {
            codeInput.style.borderColor = '#ef4444';
            setTimeout(() => {
                codeInput.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }, 2000);
            return;
        }
    
        btn.disabled = true;
        btn.innerHTML = '<i class="ph-light ph-brain"></i> Analyzing code...';
        btn.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
    
        try {
            const response = await fetch("/generate-readme", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            });
    
            const data = await response.json();
    
            if (data.readme) {
                // ✅ Display README in the page
                const readmeDiv = document.getElementById("readmeOutput");
                readmeDiv.innerHTML = `
                    <h2>Generated README</h2>
                    <pre>${data.readme}</pre>
                `;
    
                // ✅ Make README downloadable
                const blob = new Blob([data.readme], { type: "text/markdown" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "README.md";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
    
                btn.innerHTML = '<i class="ph-light ph-check-circle"></i> README Generated!';
                btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            }
        } catch (err) {
            console.error(err);
            btn.innerHTML = '<i class="ph-light ph-x-circle"></i> Error!';
            btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        } finally {
            btn.disabled = false;
        }
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
