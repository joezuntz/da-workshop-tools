function save_page_pdf(filename) {
    var opt = {
        filename: filename,
    };

    html2pdf(document.body, opt)
}