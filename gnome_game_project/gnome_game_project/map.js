class Maze {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.grid = this.createGrid();
    this.visited = this.createGrid(true); // all cells are initially unvisited
  }

  // Create an empty grid (width x height)
  createGrid(fill = false) {
    let grid = [];
    for (let y = 0; y < this.height; y++) {
      grid.push([]);
      for (let x = 0; x < this.width; x++) {
        grid[y].push(fill);
      }
    }
    return grid;
  }

  // Recursive backtracking maze generation
  generate(x = 1, y = 1) {
    // Directions: Right, Down, Left, Up
    const directions = [
      [0, 1], // right
      [1, 0], // down
      [0, -1], // left
      [-1, 0], // up
    ];

    // Randomize directions
    directions.sort(() => Math.random() - 0.5);

    // Visit the current cell
    this.visited[y][x] = true;
    this.grid[y][x] = ' '; // Open path

    // Explore neighbors
    for (let i = 0; i < directions.length; i++) {
      const nx = x + directions[i][0] * 2;
      const ny = y + directions[i][1] * 2;

      if (nx > 0 && ny > 0 && nx < this.width - 1 && ny < this.height - 1 && !this.visited[ny][nx]) {
        // Carve the path
        this.grid[ny][nx] = ' '; // Open path
        this.grid[y + directions[i][1]][x + directions[i][0]] = ' '; // Carve between cells

        // Recursively generate the maze
        this.generate(nx, ny);
      }
    }
  }

  // Draw the maze in the console
  drawConsole() {
    let mazeStr = '';
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        mazeStr += this.grid[y][x] === ' ' ? ' ' : '#';
      }
      mazeStr += '\n';
    }
    console.log(mazeStr);
  }

  // Draw the maze on the HTML canvas
  drawCanvas() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const cellSize = 4; // Scale down the cells for a 200x200 maze to fit on the screen
    canvas.width = this.width * cellSize;
    canvas.height = this.height * cellSize;
    document.body.appendChild(canvas);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        ctx.fillStyle = this.grid[y][x] === ' ' ? 'white' : 'black';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }
}

// Create and generate a 200x200 maze
const maze = new Maze(200, 200);
maze.generate();

// Draw the maze in the console (optional for debugging)
maze.drawConsole();

// Draw the maze on an HTML canvas
maze.drawCanvas();
