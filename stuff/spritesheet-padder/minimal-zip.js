// Minimal ZIP file creator - lightweight JSZip alternative for packing zip files.
// This implementation is an extremely simplified version of JSZip, focusing on basic ZIP file creation and downloading.
// It supports adding files, generating a ZIP blob, and downloading it.
// It has a function JSZip() which mimics the JSZip constructor, allowing this library to be used as a drop-in replacement for JSZip in simple use cases.
class MinimalZip {
  constructor() {
    this.files = [];
  }

  // Add a file to the ZIP
  file(name, data) {
    this.files.push({ name, data });
  }

  // Generate ZIP as blob
  async generateAsync(options = {}) {
    const zipData = this._createZip();
    return new Blob([zipData], { type: 'application/zip' });
  }

  _createZip() {
    const files = this.files;
    const zipData = [];
    const centralDirectory = [];
    let offset = 0;

    // Process each file
    for (const file of files) {
      const { name, data } = file;
      const nameBytes = new TextEncoder().encode(name);
      const fileData = data instanceof Uint8Array ? data : new Uint8Array(data);
      
      // Local file header
      const localHeader = new Uint8Array(30 + nameBytes.length);
      const localView = new DataView(localHeader.buffer);
      
      localView.setUint32(0, 0x04034b50, true); // Local file header signature
      localView.setUint16(4, 20, true); // Version needed to extract
      localView.setUint16(6, 0, true); // General purpose bit flag
      localView.setUint16(8, 0, true); // Compression method (stored)
      localView.setUint16(10, 0, true); // Last mod file time
      localView.setUint16(12, 0, true); // Last mod file date
      localView.setUint32(14, this._crc32(fileData), true); // CRC-32
      localView.setUint32(18, fileData.length, true); // Compressed size
      localView.setUint32(22, fileData.length, true); // Uncompressed size
      localView.setUint16(26, nameBytes.length, true); // File name length
      localView.setUint16(28, 0, true); // Extra field length
      
      // Copy filename
      localHeader.set(nameBytes, 30);
      
      zipData.push(localHeader);
      zipData.push(fileData);
      
      // Central directory entry
      const centralEntry = new Uint8Array(46 + nameBytes.length);
      const centralView = new DataView(centralEntry.buffer);
      
      centralView.setUint32(0, 0x02014b50, true); // Central directory signature
      centralView.setUint16(4, 20, true); // Version made by
      centralView.setUint16(6, 20, true); // Version needed to extract
      centralView.setUint16(8, 0, true); // General purpose bit flag
      centralView.setUint16(10, 0, true); // Compression method
      centralView.setUint16(12, 0, true); // Last mod file time
      centralView.setUint16(14, 0, true); // Last mod file date
      centralView.setUint32(16, this._crc32(fileData), true); // CRC-32
      centralView.setUint32(20, fileData.length, true); // Compressed size
      centralView.setUint32(24, fileData.length, true); // Uncompressed size
      centralView.setUint16(28, nameBytes.length, true); // File name length
      centralView.setUint16(30, 0, true); // Extra field length
      centralView.setUint16(32, 0, true); // File comment length
      centralView.setUint16(34, 0, true); // Disk number start
      centralView.setUint16(36, 0, true); // Internal file attributes
      centralView.setUint32(38, 0, true); // External file attributes
      centralView.setUint32(42, offset, true); // Relative offset of local header
      
      centralEntry.set(nameBytes, 46);
      centralDirectory.push(centralEntry);
      
      offset += localHeader.length + fileData.length;
    }
    
    // Calculate central directory size
    const centralDirSize = centralDirectory.reduce((sum, entry) => sum + entry.length, 0);
    
    // End of central directory record
    const endRecord = new Uint8Array(22);
    const endView = new DataView(endRecord.buffer);
    
    endView.setUint32(0, 0x06054b50, true); // End of central dir signature
    endView.setUint16(4, 0, true); // Number of this disk
    endView.setUint16(6, 0, true); // Disk where central directory starts
    endView.setUint16(8, files.length, true); // Number of central directory records on this disk
    endView.setUint16(10, files.length, true); // Total number of central directory records
    endView.setUint32(12, centralDirSize, true); // Size of central directory
    endView.setUint32(16, offset, true); // Offset of start of central directory
    endView.setUint16(20, 0, true); // ZIP file comment length
    
    // Combine all parts
    const totalSize = offset + centralDirSize + endRecord.length;
    const result = new Uint8Array(totalSize);
    let pos = 0;
    
    // Copy file data
    for (const chunk of zipData) {
      result.set(chunk, pos);
      pos += chunk.length;
    }
    
    // Copy central directory
    for (const entry of centralDirectory) {
      result.set(entry, pos);
      pos += entry.length;
    }
    
    // Copy end record
    result.set(endRecord, pos);
    
    return result;
  }

  // Simple CRC32 implementation
  _crc32(data) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) {
      crc ^= data[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
      }
    }
    return (~crc >>> 0);
  }
}

// Global constructor to match JSZip API
function JSZip() {
  return new MinimalZip();
}
