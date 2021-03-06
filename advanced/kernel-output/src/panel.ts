import { ClientSession, IClientSession } from '@jupyterlab/apputils';

import { OutputAreaModel, SimplifiedOutputArea } from '@jupyterlab/outputarea';

import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

import { KernelMessage, ServiceManager } from '@jupyterlab/services';

import { Message } from '@phosphor/messaging';

import { StackedPanel } from '@phosphor/widgets';

/**
 * The class name added to the example panel.
 */
const PANEL_CLASS = 'jp-RovaPanel';

/**
 * A panel with the ability to add other children.
 */
export class ExamplePanel extends StackedPanel {
  constructor(
    manager: ServiceManager.IManager,
    rendermime: IRenderMimeRegistry
  ) {
    super();
    this.addClass(PANEL_CLASS);
    this.id = 'kernel-output-panel';
    this.title.label = 'Example View';
    this.title.closable = true;

    this._session = new ClientSession({
      manager: manager.sessions,
      name: 'Example'
    });

    this._outputareamodel = new OutputAreaModel();
    this._outputarea = new SimplifiedOutputArea({
      model: this._outputareamodel,
      rendermime: rendermime
    });

    this.addWidget(this._outputarea);
    this._session.initialize().catch(reason => {
      console.error(
        `Failed to initialize the session in ExamplePanel.\n${reason}`
      );
    });
  }

  get session(): IClientSession {
    return this._session;
  }

  dispose(): void {
    this._session.dispose();
    super.dispose();
  }

  execute(code: string): void {
    SimplifiedOutputArea.execute(code, this._outputarea, this._session)
      .then((msg: KernelMessage.IExecuteReplyMsg) => {
        console.log(msg);
      })
      .catch(reason => console.error(reason));
  }

  protected onCloseRequest(msg: Message): void {
    super.onCloseRequest(msg);
    this.dispose();
  }

  private _session: ClientSession;
  private _outputarea: SimplifiedOutputArea;
  private _outputareamodel: OutputAreaModel;
}
