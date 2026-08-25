import { useRef, useState } from 'react';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import UploadIcon from '@mui/icons-material/FileUploadOutlined';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { toDayKey } from '../lib/day';

/**
 * Backup and restore. Data lives in one browser, so an export file is the only
 * way to move a history to another machine -- or to keep it at all.
 */
export function DataMenu({ onImported }) {
  const [anchor, setAnchor] = useState(null);
  const fileInput = useRef(null);
  const toast = useToast();

  const close = () => setAnchor(null);

  const handleExport = async () => {
    close();
    try {
      const data = await api.exportAll();
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = `macro-tracker-${toDayKey()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast('Exported your data');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const { meals, days } = await api.importAll(JSON.parse(await file.text()));
      onImported?.();
      toast(`Imported ${meals} meals across ${days} targets`);
    } catch (err) {
      toast(err instanceof SyntaxError ? 'That file is not valid JSON.' : err.message, 'error');
    }
  };

  return (
    <>
      <Tooltip title="Backup and restore">
        <IconButton size="small" onClick={(event) => setAnchor(event.currentTarget)} aria-label="Data options">
          <MoreVertIcon />
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close}>
        <MenuItem onClick={handleExport}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export data</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            close();
            fileInput.current?.click();
          }}
        >
          <ListItemIcon>
            <UploadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Import data…</ListItemText>
        </MenuItem>
      </Menu>

      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={handleFile}
      />
    </>
  );
}
