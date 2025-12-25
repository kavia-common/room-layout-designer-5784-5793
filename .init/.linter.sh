#!/bin/bash
cd /tmp/kavia/workspace/code-generation/room-layout-designer-5784-5793/room_mapper_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

