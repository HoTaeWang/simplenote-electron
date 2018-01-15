import React from 'react';
import { connect } from 'react-redux';
import MonacoEditor from 'react-monaco-editor';

export class Editor extends React.Component {
  state = {
    width: 800,
    height: 600,
  };

  componentDidMount() {
    window.addEventListener('resize', this.resize, false);
    this.resize();

    this.props.storeFocusEditor(() => this.editor && this.editor.focus());
    this.props.storeHasFocus(() => this.editor && this.editor.isFocused());
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize, false);
  }

  componentDidUpdate({ theme }) {
    if (theme !== this.props.theme) {
      this.setTheme();
    }
  }

  // `event` left in for reference - passes the diff of changes
  // eslint-disable-next-line no-unused-vars
  onChange = (value, event) => {
    this.props.onChangeContent(value);
  };

  resize = () => {
    if (!this.container) {
      return;
    }

    const now = performance.now();
    if (this.lastResize && now - this.lastResize < 1000 / 60) {
      return;
    }

    this.lastResize = now;

    this.setState(
      {
        width: this.container.clientWidth,
        height: this.container.clientHeight,
      },
      () => this.editor && this.editor.layout()
    );
  };

  setTheme = () => {
    if (!this.monaco) {
      return;
    }

    const { theme } = this.props;
    const background = theme === 'dark' ? '2d3034' : 'ffffff';

    this.monaco.editor.defineTheme(theme, {
      base: theme === 'dark' ? 'vs-dark' : 'vs',
      inherit: true,
      rules: [{ background }],
      colors: {
        'editor.background': `#${background}`,
      },
    });

    this.monaco.editor.setTheme(theme);
  };

  storeContainer = ref => (this.container = ref);

  storeEditor = (editor, monaco) => {
    this.editor = editor;
    this.monaco = monaco;

    this.setTheme();

    editor.focus();
  };

  render() {
    const { content, markdownIsEnabled, theme } = this.props;
    const { height, width } = this.state;

    return (
      <div ref={this.storeContainer} style={{ width: '100%', height: '100%' }}>
        <MonacoEditor
          editorDidMount={this.storeEditor}
          width={width}
          height={height}
          language={markdownIsEnabled ? 'markdown' : 'text'}
          onChange={this.onChange}
          theme={theme}
          value={content}
          options={{
            lineNumbers: false,
            minimap: { enabled: false },
            renderLineHighlight: 'none',
            selectionHighlight: false,
            wordWrap: 'on',
          }}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  markdownIsEnabled: state.settings.markdownEnabled,
  theme: state.settings.theme,
});

export default connect(mapStateToProps)(Editor);
