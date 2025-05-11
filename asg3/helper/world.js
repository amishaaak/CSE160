class World {
    voxel = 0.5; //size of single cube edge
    logic = 2; // number of voxels per logic maze cell
    grid  = 32; //final voxel grid is 32 x 32
  
    constructor() {
        /* --- creating the logical maze dimensions --- */

        //1.) Build a perfect‐maze outline on a coarse logical grid
        //2.) Determine your start position inside that maze.
        //3.) Up-sample that logical maze into a 32×32 grid, assigning each wall cell a two‐high stack of voxels in this.world[x][z]

        this.logicCells = Math.floor(this.grid / this.logic);
        if (this.logicCells % 2 === 0) this.logicCells--;
        
        const L = this.logicCells;
        const maze = Array(L).fill().map(()=>Array(L).fill(1)); //initializing array of 1's
        const carve = (x,z) => {
          maze[x][z] = 0;
          for (const [dx,dz] of shuffle([[2,0],[-2,0],[0,2],[0,-2]])) {
            const nx = x+dx, nz = z+dz;
            if (nx>0&&nx<L-1&&nz>0&&nz<L-1&&maze[nx][nz]) {
              maze[x+dx/2][z+dz/2]=0;
              carve(nx,nz);
            }
          }
        };
        carve(1,1);

        const sx = 1*this.logic + Math.floor(this.logic/2);
        const sz = 1*this.logic + Math.floor(this.logic/2);
        this.startVoxel = { x: sx, z: sz };
      
        /* --- expand to 32×32 height map (0,2,3) --- */
        this.width = this.depth = this.grid;
        this.height = 3;
        this.world = Array(this.grid).fill().map(()=>Array(this.grid).fill(0)); 
        
        // converts each logical cell to a voxel cell
        for (let lx = 0; lx < L; lx++) {
            for (let lz = 0; lz < L; lz++) {
              let h = 0;
              if (maze[lx][lz]) {
                h = 2;
              }
          
              for (let ox = 0; ox < this.logic; ox++) {
                for (let oz = 0; oz < this.logic; oz++) {
                  const vx = lx * this.logic + ox;
                  const vz = lz * this.logic + oz;
                  if (vx < this.grid && vz < this.grid) {
                    this.world[vx][vz] = h;
                  }
                }
              }
            }
        }
          
        
        // override the perimeter to ensure it's set to height 3
        for (let x = 0; x < this.grid; x++) {
          for (let z = 0; z < this.grid; z++) {
            if (x === 0 || z === 0 || x === this.grid-1 || z === this.grid-1) {
              this.world[x][z] = 3;
            }
          }
        }
        
        // create the 3D array for blocks 
        this.blocks = Array(this.grid).fill().map(
           ()=>Array(this.grid).fill().map(
                ()=>Array(this.height).fill(0)));

        // create the 3D array for food to track where dog food blocks have been placed
        this.food = Array(this.grid).fill().map(
            ()=>Array(this.grid).fill().map(
                ()=>Array(this.height).fill(0)));

        // set the blocks to 1 for all cells that are not empty.. drawMap and your collision
        // routines both need to know, for any given voxel in space, whether it’s solid or empty.
        for (let x=0;x<this.grid;x++)
          for (let z=0;z<this.grid;z++)
            for (let y=0;y<this.world[x][z];y++)
              this.blocks[x][z][y]=1;

        
        const deep = this.findDeepestLogicalCell();     // {lx, lz, d}
        const dogPos2D = this.logicalToWorld(deep.lx, deep.lz);
        this.dogX = dogPos2D.x;
        this.dogZ = dogPos2D.z;
    }
 
    /* --- draw the world --- */
    drawMap() {
        const s = this.voxel;
        const half = (this.grid*s)/2;
        const cube = new Cube();

        
      
        for (let x=0; x<this.grid; x++){
          for (let z=0; z<this.grid; z++){
            const h = this.world[x][z]; 
            if (!h) continue;
            
            // Set color based on whether it's a perimeter wall or interior wall
            if (h === 3) {
                cube.color = [0.25, 0.12, 0.04, 1];
              } else {
                cube.color = [0.55, 0.28, 0.08, 1];
            }
            
            for (let y=0; y<h; y++){
              cube.textureNum = 0;
              cube.matrix.setIdentity();
              cube.matrix.translate(
                  (x + 0.5) * s - half,   
                  y * s - 0.75,           
                  (z + 0.5) * s - half  
              ); 
              cube.matrix.scale(s, s, s);
              cube.renderFast();
            }
          }
        }
    }
    // draw the dog food blocks
    drawDynamicBlocks() {
        const base = this.voxel;
        const s = base * 0.9;
        const half = (this.grid * base) / 2;
        const inset = (base - s) / 2;
        const cube  = new Cube();
        cube.textureNum = 5;
      
        for (let x = 0; x < this.grid; ++x)
          for (let z = 0; z < this.depth; ++z)
            for (let y = 0; y < this.height; ++y)
              if (this.food[x][z][y]) {
                cube.matrix.setIdentity();
                cube.matrix.translate(
                  (x + 0.5) * base - half + inset,
                  y * base - 0.75 + inset,
                  (z + 0.5) * base - half + inset
                );
                cube.matrix.scale(s, s, s);
                cube.renderFast();
              }
    }

    /* --- convert world coordinates to logical coordinates --- */  

    //takes a continuous X position and tells you which column in your 32×32 maze it lies in
    worldXtoI(xWorld){
        const half = (this.grid * this.voxel) / 2;
        return Math.floor((xWorld + half) / this.voxel);
    }

    //takes a vertical height and tells you which block‐layer (floor, 1st, 2nd) it corresponds to
    worldYtoI(yWorld){
        return Math.floor((yWorld + 0.75) / this.voxel);
    }
    
    //this method adds a new “food” block one step in front of where the camera is looking
    placeBlock(camera){
        const ex = this.worldXtoI(camera.eye.elements[0]);
        const ey = this.worldYtoI(camera.eye.elements[1]);
        const ez = this.worldXtoI(camera.eye.elements[2]);
    
        const ax = this.worldXtoI(camera.at.elements[0]);
        const ay = this.worldYtoI(camera.at.elements[1]);
        const az = this.worldXtoI(camera.at.elements[2]);
    
        const dx = Math.sign(ax - ex);
        const dz = Math.sign(az - ez);
        const dy = 0;
    
        const tx = ex + dx;
        const ty = ey + dy;
        const tz = ez + dz;
    
        if (  tx >= 0 && tx < this.width &&
            tz >= 0 && tz < this.depth &&
            ty >= 0 && ty < this.height &&
            this.blocks[tx][tz][ty] === 0 )
        {
            this.blocks[tx][tz][ty] = 1;
            this.food[tx][tz][ty] = 1
            console.log(`Block placed @ (${tx}, ${ty}, ${tz})`);
        }
    }
    
    //this method removes (“destroys”) the topmost block in the column directly in front of the camera.
    removeBlock(camera) {
        const ex = this.worldXtoI(camera.eye.elements[0]);
        const ez = this.worldXtoI(camera.eye.elements[2]);
        const ax = this.worldXtoI(camera.at.elements[0]);
        const az = this.worldXtoI(camera.at.elements[2]);
    
        const tx = ex + Math.sign(ax - ex);
        const tz = ez + Math.sign(az - ez);
        if (tx < 0 || tx >= this.width || tz < 0 || tz >= this.depth) return;
    
        let ty = this.height - 1;
        while (ty >= 0 && this.blocks[tx][tz][ty] === 0) ty--;
        if (ty < 0) return;
    
        this.blocks[tx][tz][ty] = 0;
        this.food[tx][tz][ty] = 0;

    
        console.log(`Block removed @ (${tx}, ${ty}, ${tz})`);
    }

    //this method finds the logical maze cell that is farthest (in terms of shortest‐path distance) 
    //from the start (1,1), using a breadth‐first search (BFS) over the logical grid
    
    findDeepestLogicalCell() {
        const L     = this.logicCells;
        const g     = this.world;
        const step  = this.logic;
    
        const q = [{lx:1, lz:1, d:0}];
        const seen = new Set(['1,1']);
        let best = {lx:1, lz:1, d:0};
    
        while (q.length) {
        const {lx,lz,d} = q.shift();
        if (d > best.d) best = {lx,lz,d};
        for (const [dlx,dlz] of [[2,0],[-2,0],[0,2],[0,-2]]) {
            const nx = lx+dlx, nz = lz+dlz;
            if (nx>0&&nx<L-1&&nz>0&&nz<L-1 && g[nx*step][nz*step]===0) {
            const key = `${nx},${nz}`;
            if (!seen.has(key)) {
                seen.add(key);
                q.push({lx:nx, lz:nz, d:d+1});
            }
            }
        }
        }
        return best; // {lx, lz, d: longest-shortest-path length}
    }
    
    //Converts a logical grid coordinate (lx, lz) back into continuous world coordinates (meters),
    //centering on the middle of the corresponding voxel block.
    logicalToWorld(lx, lz) {
        const s    = this.voxel;
        const half = (this.grid * s) / 2;
        const vxCenter = lx * this.logic + this.logic/2;
        const vzCenter = lz * this.logic + this.logic/2;
        return {
        x: (vxCenter) * s - half,
        z: (vzCenter) * s - half
        };
    }
  
}
  
  //randomizes the order of an array
  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}