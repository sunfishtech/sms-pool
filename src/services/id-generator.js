import uuid from 'uuid';

export default function IdGenerator(config = {}) {
  const version = config.version || 'v1';

  return {
    next: () => uuid[version]()
  };
}
