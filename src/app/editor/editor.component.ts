import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// CKEDITOR global is loaded from CDN in index.html
declare const CKEDITOR: any;

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, OnDestroy {

  // ── CKEditor instance ──
  public Editor: any = CKEDITOR.ClassicEditor;

  // ── Reactive Form ──
  public form!: FormGroup;

  // ── UI State ──
  public isSidebarOpen = true;
  public activeTemplate = '';
  public wordCount = 0;
  public charCount = 0;
  public paraCount = 0;
  public lastSaved = 'Not saved';
  public isSaving = false;
  private autoSaveTimer: any;

  // ── CKEditor Full Config ──
  public editorConfig: any = {
    toolbar: {
      items: [
        // Source editing — first in toolbar
        'sourceEditing', '|',

        // Search
        'findAndReplace', 'selectAll', '|',

        // Structure
        'heading', '|',

        // Font
        'fontSize', 'fontFamily', '|',

        // Color
        'fontColor', 'fontBackgroundColor', 'highlight', '|',

        // Inline formatting
        'bold', 'italic', 'underline', 'strikethrough',
        'code', 'subscript', 'superscript', 'removeFormat', '|',

        // Alignment
        'alignment', '|',

        // Lists
        'bulletedList', 'numberedList', 'todoList', '|',

        // Indent
        'outdent', 'indent', '|',

        // History
        'undo', 'redo',

        // Line break — second row
        '-',

        // Insert
        'link', 'uploadImage', 'blockQuote',
        'insertTable', 'mediaEmbed', 'codeBlock', 'htmlEmbed', '|',

        // Extras
        'specialCharacters', 'horizontalLine', 'pageBreak', '|',

        // Language
        'textPartLanguage'
      ],
      shouldNotGroupWhenFull: true
    },

    // Remove premium-only plugins (required for superbuild)
    removePlugins: [
      'AIAssistant',
      'CKBox',
      'CKFinder',
      'EasyImage',
      'RealTimeCollaborativeComments',
      'RealTimeCollaborativeTrackChanges',
      'RealTimeCollaborativeRevisionHistory',
      'PresenceList',
      'Comments',
      'TrackChanges',
      'TrackChangesData',
      'RevisionHistory',
      'Pagination',
      'WProofreader',
      'MathType',
      'SlashCommand',
      'Template',
      'DocumentOutline',
      'FormatPainter',
      'TableOfContents',
      'PasteFromOfficeEnhanced',
      'CaseChange',
      'MultiLevelList',
      'ExportPdf',
      'ExportWord'
    ],

    // Heading options
    heading: {
      options: [
        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
        { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
        { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
        { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
        { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
        { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
        { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
      ]
    },

    // Font size
    fontSize: {
      options: [10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 48, 60, 72],
      supportAllValues: true
    },

    // Font family
    fontFamily: {
      options: [
        'default',
        'Arial, Helvetica, sans-serif',
        'Georgia, serif',
        'Times New Roman, Times, serif',
        'Courier New, Courier, monospace',
        'Verdana, Geneva, sans-serif',
        'Trebuchet MS, Helvetica, sans-serif',
        'Impact, Charcoal, sans-serif'
      ],
      supportAllValues: true
    },

    // Font colors
    fontColor: {
      columns: 5,
      colors: [
        { color: '#000000', label: 'Black' },
        { color: '#4d4d4d', label: 'Dim grey' },
        { color: '#999999', label: 'Grey' },
        { color: '#e6e6e6', label: 'Light grey' },
        { color: '#ffffff', label: 'White', hasBorder: true },
        { color: '#e64c4c', label: 'Red' },
        { color: '#e6994c', label: 'Orange' },
        { color: '#e6e64c', label: 'Yellow' },
        { color: '#99e64c', label: 'Light green' },
        { color: '#4ce64c', label: 'Green' },
        { color: '#4ce6e6', label: 'Aquamarine' },
        { color: '#4c99e6', label: 'Turquoise' },
        { color: '#4c4ce6', label: 'Blue' },
        { color: '#994ce6', label: 'Purple' },
        { color: '#2d4a3e', label: 'Forest' }
      ]
    },

    // Background colors
    fontBackgroundColor: {
      columns: 5,
      colors: [
        { color: '#000000', label: 'Black' },
        { color: '#4d4d4d', label: 'Dim grey' },
        { color: '#999999', label: 'Grey' },
        { color: '#e6e6e6', label: 'Light grey' },
        { color: '#ffffff', label: 'White', hasBorder: true },
        { color: '#ffd6d6', label: 'Pink' },
        { color: '#ffe6cc', label: 'Peach' },
        { color: '#ffffcc', label: 'Yellow' },
        { color: '#d6f5d6', label: 'Light green' },
        { color: '#d6f0f5', label: 'Light blue' },
        { color: '#e8f0ed', label: 'Mint' }
      ]
    },

    // Highlight
    highlight: {
      options: [
        { model: 'yellowMarker', class: 'marker-yellow', title: 'Yellow marker', color: '#fdfd77', type: 'marker' },
        { model: 'greenMarker', class: 'marker-green', title: 'Green marker', color: '#63f963', type: 'marker' },
        { model: 'pinkMarker', class: 'marker-pink', title: 'Pink marker', color: '#fc7999', type: 'marker' },
        { model: 'blueMarker', class: 'marker-blue', title: 'Blue marker', color: '#72cdfd', type: 'marker' },
        { model: 'redPen', class: 'pen-red', title: 'Red pen', color: '#e91313', type: 'pen' },
        { model: 'greenPen', class: 'pen-green', title: 'Green pen', color: '#118800', type: 'pen' }
      ]
    },

    // Table
    table: {
      contentToolbar: [
        'tableColumn',
        'tableRow',
        'mergeTableCells',
        'tableProperties',
        'tableCellProperties',
        'toggleTableCaption'
      ]
    },

    // Image
    image: {
      toolbar: [
        'imageStyle:inline',
        'imageStyle:block',
        'imageStyle:side',
        '|',
        'toggleImageCaption',
        'imageTextAlternative',
        '|',
        'linkImage'
      ]
    },

    // List
    list: {
      properties: {
        styles: true,
        startIndex: true,
        reversed: true
      }
    },

    // Link
    link: {
      defaultProtocol: 'https://',
      decorators: {
        addTargetToExternalLinks: true
      }
    },

    // HTML embed
    htmlEmbed: {
      showPreviews: false
    },

    // Allow all HTML
    htmlSupport: {
      allow: [
        { name: /.*/, attributes: true, classes: true, styles: true }
      ]
    }
  };

  // ── Templates ──
  private readonly templates: Record<string, string> = {
    blank: '<p></p>',

    report: `
      <h1>Report Title</h1>
      <p><strong>Author:</strong> Your Name &nbsp;|&nbsp; <strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      <hr>
      <h2>Executive Summary</h2>
      <p>Provide a brief overview of the report's key findings and recommendations here.</p>
      <h2>Introduction</h2>
      <p>Describe the background, purpose, and scope of this report.</p>
      <h2>Findings</h2>
      <ul>
        <li>Finding one — describe in detail</li>
        <li>Finding two — describe in detail</li>
        <li>Finding three — describe in detail</li>
      </ul>
      <h2>Recommendations</h2>
      <p>List your recommendations based on the findings above.</p>
      <ol>
        <li>Recommendation one</li>
        <li>Recommendation two</li>
        <li>Recommendation three</li>
      </ol>
      <h2>Conclusion</h2>
      <p>Summarise the report and outline the next steps.</p>
    `,

    letter: `
      <p>${new Date().toLocaleDateString()}</p>
      <p>&nbsp;</p>
      <p>Dear [Recipient Name],</p>
      <p>&nbsp;</p>
      <p>I am writing to [state the purpose of the letter clearly and concisely].</p>
      <p>&nbsp;</p>
      <p>[Body paragraph — expand on the main point. Provide supporting details, context, or evidence as needed.]</p>
      <p>&nbsp;</p>
      <p>[Closing paragraph — state any required action, next steps, or express appreciation.]</p>
      <p>&nbsp;</p>
      <p>Please do not hesitate to contact me should you require any further information.</p>
      <p>&nbsp;</p>
      <p>Yours sincerely,</p>
      <p>&nbsp;</p>
      <p>[Your Name]<br>[Your Title]<br>[Your Organisation]<br>[Email] | [Phone]</p>
    `,

    meeting: `
      <h1>Meeting Notes</h1>
      <p>
        <strong>Date:</strong> ${new Date().toLocaleDateString()} &nbsp;|&nbsp;
        <strong>Time:</strong> &nbsp;|&nbsp;
        <strong>Location:</strong>
      </p>
      <p><strong>Attendees:</strong></p>
      <hr>
      <h2>Agenda</h2>
      <ol>
        <li>Item one</li>
        <li>Item two</li>
        <li>Item three</li>
      </ol>
      <h2>Discussion Points</h2>
      <p>Notes from the meeting discussion.</p>
      <h2>Decisions Made</h2>
      <ul>
        <li>Decision one</li>
        <li>Decision two</li>
      </ul>
      <h2>Action Items</h2>
      <figure class="table">
        <table>
          <thead><tr><th>Action</th><th>Owner</th><th>Due Date</th></tr></thead>
          <tbody>
            <tr><td>Action item 1</td><td></td><td></td></tr>
            <tr><td>Action item 2</td><td></td><td></td></tr>
          </tbody>
        </table>
      </figure>
      <h2>Next Meeting</h2>
      <p>Date and agenda for the next meeting.</p>
    `,

    article: `
      <h1>Article Title</h1>
      <p><em>Subtitle or tagline goes here</em></p>
      <p><strong>By</strong> [Author Name] &nbsp;·&nbsp; ${new Date().toLocaleDateString()}</p>
      <hr>
      <h2>Introduction</h2>
      <p>Hook the reader with an engaging opening paragraph. State the main topic and why it matters.</p>
      <h2>Background</h2>
      <p>Provide context and background information the reader needs to understand the topic.</p>
      <h2>Main Section</h2>
      <p>Develop your main argument or narrative here. Use subheadings, lists, and quotes to break up the text.</p>
      <blockquote><p>"A relevant quote or key insight that supports your article's theme."</p></blockquote>
      <h2>Analysis</h2>
      <p>Analyse and interpret the information you have presented.</p>
      <h2>Conclusion</h2>
      <p>Summarise the key points and leave the reader with a clear takeaway or call to action.</p>
    `
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['Untitled Document'],
      content: [this.templates['article'], Validators.required]
    });

    // Restore from localStorage
    this.restoreFromStorage();
  }

  ngOnDestroy(): void {
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
  }

  // ── Editor Ready ──
  onEditorReady(editor: any): void {
    console.log('CKEditor 5 ready. Plugins loaded:', editor.plugins);
    // Update word count when editor data changes
    editor.model.document.on('change:data', () => {
      this.updateCounts(editor.getData());
      this.scheduleAutoSave();
    });
    this.updateCounts(this.form.get('content')?.value || '');
  }

  // ── Word / Char / Para Count ──
  private updateCounts(html: string): void {
    const plain = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    this.wordCount = plain ? plain.split(/\s+/).length : 0;
    this.charCount = plain.length;
    this.paraCount = (html.match(/<p[\s>]/gi) || []).length;
  }

  // ── Auto Save ──
  private scheduleAutoSave(): void {
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => this.saveToStorage(), 3000);
  }

  // ── Save ──
  saveToStorage(): void {
    this.isSaving = true;
    const data = {
      title: this.form.get('title')?.value,
      content: this.form.get('content')?.value,
      savedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem('ck5_angular18_doc', JSON.stringify(data));
      const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.lastSaved = 'Saved at ' + t;
    } catch {
      this.lastSaved = 'Save failed';
    }
    setTimeout(() => this.isSaving = false, 600);
  }

  // ── Restore ──
  private restoreFromStorage(): void {
    try {
      const raw = localStorage.getItem('ck5_angular18_doc');
      if (raw) {
        const data = JSON.parse(raw);
        this.form.patchValue({ title: data.title, content: data.content });
        const d = new Date(data.savedAt);
        this.lastSaved = 'Last saved ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    } catch {
      // ignore
    }
  }

  // ── Load Template ──
  loadTemplate(key: string): void {
    this.activeTemplate = key;
    const tpl = this.templates[key];
    if (tpl) {
      this.form.patchValue({ content: tpl });
      this.updateCounts(tpl);
    }
  }

  // ── New Document ──
  newDocument(): void {
    if (confirm('Start a new document? Unsaved changes will be lost.')) {
      this.form.patchValue({ title: 'Untitled Document', content: '<p></p>' });
      this.wordCount = 0;
      this.charCount = 0;
      this.paraCount = 0;
      this.lastSaved = 'Not saved';
      this.activeTemplate = '';
    }
  }

  // ── Export HTML ──
  exportHTML(): void {
    const title = this.form.get('title')?.value || 'document';
    const content = this.form.get('content')?.value || '';
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 0 24px; line-height: 1.8; color: #1a1814; }
    h1, h2, h3, h4, h5, h6 { font-family: Georgia, serif; margin: 1.5em 0 0.5em; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ccc; padding: 8px 12px; }
    blockquote { border-left: 4px solid #ccc; margin: 1em 0; padding-left: 1em; color: #555; }
    pre { background: #f4f4f4; padding: 16px; border-radius: 4px; overflow-x: auto; }
    code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${content}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = title.replace(/\s+/g, '-').toLowerCase() + '.html';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ── Submit (get data) ──
  onSubmit(): void {
    const value = this.form.value;
    console.log('=== Form Data ===');
    console.log('Title:', value.title);
    console.log('HTML Content:', value.content);
    alert('Check browser console for output.');
  }

  // ── Toggle Sidebar ──
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
