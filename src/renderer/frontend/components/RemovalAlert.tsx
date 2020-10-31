import React, { useContext } from 'react';
import { ClientLocation } from 'src/renderer/entities/Location';
import StoreContext from 'src/renderer/frontend/contexts/StoreContext';
import { ClientTag } from 'src/renderer/entities/Tag';
import { Tag, IconSet } from 'components';
import { Alert, DialogButton } from 'components/popover';
import { observer } from 'mobx-react-lite';

interface IRemovalAlertProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  information: string;
  body?: React.ReactNode;
}

const RemovalAlert = (props: IRemovalAlertProps) => (
  <Alert
    open={props.open}
    title={props.title}
    information={props.information}
    view={props.body}
    icon={IconSet.WARNING}
    closeButtonText="Cancel"
    primaryButtonText="Delete"
    defaultButton={DialogButton.PrimaryButton}
    onClick={(button) =>
      button === DialogButton.CloseButton ? props.onCancel() : props.onConfirm()
    }
  />
);

interface IRemovalProps<T> {
  object: T;
  onClose: () => void;
}

export const LocationRemoval = (props: IRemovalProps<ClientLocation>) => (
  <RemovalAlert
    open
    title={`Are you sure you want to delete the location "${props.object.name}"?`}
    information="This will permanently remove the location and all files contained in it from Allusion."
    onCancel={props.onClose}
    onConfirm={() => {
      props.onClose();
      props.object.delete();
    }}
  />
);

export const TagRemoval = observer((props: IRemovalProps<ClientTag>) => {
  const { uiStore } = useContext(StoreContext);
  const { object } = props;
  const tagsToRemove = object.isSelected ? Array.from(uiStore.tagSelection) : object.toList();

  const text = `Are you sure you want to delete the tag "${object.name}"?`;

  return (
    <RemovalAlert
      open
      title={text}
      information="Deleting tags or collections will permanently remove them from Allusion."
      body={
        tagsToRemove.length > 0 && (
          <div id="tag-remove-overview">
            <p>Selected Tags</p>
            {tagsToRemove.map((tag) => (
              <Tag key={tag.id} text={tag.name} color={tag.viewColor} />
            ))}
          </div>
        )
      }
      onCancel={props.onClose}
      onConfirm={() => {
        props.onClose();
        object.isSelected ? uiStore.removeSelectedTags() : props.object.delete();
      }}
    />
  );
});

export const FileRemoval = observer(() => {
  const { fileStore, uiStore } = useContext(StoreContext);
  const selection = uiStore.fileSelection;

  return (
    <RemovalAlert
      open={uiStore.isToolbarFileRemoverOpen}
      title={`Are you sure you want to delete ${selection.size} missing file${
        selection.size > 1 ? 's' : ''
      }?`}
      information="Deleting files will permanently remove them from Allusion. Accidentially moved files can be recovered by returning them to their previous location."
      onCancel={uiStore.closeToolbarFileRemover}
      onConfirm={() => {
        uiStore.closeToolbarFileRemover();
        const files = [];
        for (const file of selection) {
          if (file.isBroken === true) {
            files.push(file.id);
          }
        }
        fileStore.deleteFiles(files);
      }}
    />
  );
});
