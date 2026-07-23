import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import DropdownMenu from '../components/DropdownMenu.jsx';

function DropdownRoot() {
  const [open, setOpen] = useState(false);
  const [hwAccelEnabled, setHwAccelEnabled] = useState(false);
  const [adBlockerEnabled, setAdBlockerEnabled] = useState(true);

  useEffect(() => {
    // Query current hardware acceleration state from main process
    if (window.electronAPI && window.electronAPI.getHardwareAcceleration) {
      window.electronAPI.getHardwareAcceleration().then(setHwAccelEnabled);
    }
    // Query current adblocker state from main process
    if (window.electronAPI && window.electronAPI.getAdblockerEnabled) {
      window.electronAPI.getAdblockerEnabled().then(setAdBlockerEnabled);
    }
  }, [open]);

  function handleAction(id) {
    setOpen(false);
    if (id === 'toggle-hwaccel') {
      if (window.electronAPI && window.electronAPI.toggleHardwareAcceleration) {
        window.electronAPI.toggleHardwareAcceleration().then(result => {
          setHwAccelEnabled(result.enabled);
          if (result.restartRequired) {
            // Trigger restart modal if available in global scope or via event
            const hwaccelToggle = document.getElementById('hwaccel-toggle');
            if (hwaccelToggle) {
               hwaccelToggle.checked = result.enabled;
               hwaccelToggle.dispatchEvent(new Event('change'));
            }
          }
        });
      }
      return;
    }
    if (id === 'toggle-adblocker') {
      if (window.electronAPI && window.electronAPI.setAdblockerEnabled) {
        const newValue = !adBlockerEnabled;
        window.electronAPI.setAdblockerEnabled(newValue).then(result => {
          if (result.success) {
            setAdBlockerEnabled(result.enabled);
          }
        });
      }
      return;
    }
    setTimeout(() => {
      const btn = document.getElementById(id);
      if (btn) btn.click();
    }, 10);
  }

  useEffect(() => {
    const menuBtn = document.getElementById('menu-btn');
    if (!menuBtn) return;
    const toggle = () => setOpen(o => !o);
    menuBtn.addEventListener('click', toggle);
    return () => menuBtn.removeEventListener('click', toggle);
  }, []);

  return <DropdownMenu open={open} onClose={() => setOpen(false)} onAction={handleAction} hwAccelEnabled={hwAccelEnabled} adBlockerEnabled={adBlockerEnabled} />;
}

const dropdownContainer = document.querySelector('.dropdown');
if (dropdownContainer) {
  const reactRoot = document.createElement('div');
  reactRoot.id = 'dropdown-root';
  dropdownContainer.appendChild(reactRoot);
  createRoot(reactRoot).render(<DropdownRoot />);
}

