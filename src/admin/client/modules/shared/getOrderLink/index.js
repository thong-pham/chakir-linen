import React from 'react'
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

export default class OrderLinkDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: props.open
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.open !== nextProps.open) {
      this.setState({
        open: nextProps.open
      })
    }
  }

  handleCancel = () => {
    this.setState({open: false});
    if(this.props.onCancel) {
      this.props.onCancel();
    }
  }

  render() {
    const { title, orderLink, submitLabel, cancelLabel, modal = false } = this.props;

    const actions = [
      <FlatButton
        label={cancelLabel}
        onClick={this.handleCancel}
        style={{ marginRight: 10 }}
      />
    ];

    return (
        <Dialog
          title={title}
          actions={actions}
          modal={modal}
          open={this.state.open}
          onRequestClose={this.handleCancel}
        >
          <div>
            <TextField
               fullWidth={true}
               value={orderLink}
             />
          </div>
        </Dialog>
    )
  }
}
