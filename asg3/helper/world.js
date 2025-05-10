class World {
    voxel = 0.5; //size of single cube edge
    logic = 2; // number of voxels per logic maze cell
    grid  = 32; //final voxel grid is 32 x 32
  
    constructor() {
        /* --- creating the logical maze dimensions --- */
        this.logicCells = Math.floor(this.grid / this.logic);
        if (this.logicCells % 2 === 0) this.logicCells--;   // make odd
      
        // c
        const L = this.logicCells;
        const maze = Array(L).fill().map(()=>Array(L).fill(1));
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
      
        for (let lx = 0; lx < L; lx++) {
            for (let lz = 0; lz < L; lz++) {
              // start with 0, then bump to 2 if it's a wall
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
      
        /* --- occupancy flags for collision --- */
        this.blocks = Array(this.grid).fill().map(
           ()=>Array(this.grid).fill().map(
                ()=>Array(this.height).fill(0)
           ));
        for (let x=0;x<this.grid;x++)
          for (let z=0;z<this.grid;z++)
            for (let y=0;y<this.world[x][z];y++)
              this.blocks[x][z][y]=1;
    }
  
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
              cube.matrix.setIdentity();
              cube.matrix.translate(
                  (x + 0.5) * s - half,   // x-centre
                  y * s - 0.75,           // height
                  (z + 0.5) * s - half    // z-centre
              ); 
              cube.matrix.scale(s, s, s);
              cube.renderFast();
            }
          }
        }
    }

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
              if (this.blocks[x][z][y]) {
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

/* ──────────────  helpers: convert world-space → voxel index ───────── */
  worldXtoI(xWorld){            // –8 … +8  →  0 … 31  (for voxel=0.5, grid=32)
    const half = (this.grid * this.voxel) / 2;      // = 8 for your set-up
    return Math.floor((xWorld + half) / this.voxel);
  }
  worldYtoI(yWorld){            // –0.75 …             → voxel layer (0,1,2…)
    /* the –0.75 shift matches drawMap()’s “y*s – 0.75” placement */
    return Math.floor((yWorld + 0.75) / this.voxel);
  }
  
  placeBlock(camera){
    /* 1.  Convert eye & look-at positions from world coords to indices  */
    const ex = this.worldXtoI(camera.eye.elements[0]);
    const ey = this.worldYtoI(camera.eye.elements[1]);
    const ez = this.worldXtoI(camera.eye.elements[2]);
  
    const ax = this.worldXtoI(camera.at.elements[0]);
    const ay = this.worldYtoI(camera.at.elements[1]);
    const az = this.worldXtoI(camera.at.elements[2]);
  
    /* 2.  Direction the player is looking (–1, 0, or +1 on each axis)  */
    const dx = Math.sign(ax - ex);
    const dz = Math.sign(az - ez);
    const dy = 0;                       // keep everything in one layer
  
    /* 3.  Target voxel just in front of the player                      */
    const tx = ex + dx;
    const ty = ey + dy;
    const tz = ez + dz;
  
    /* 4.  Bounds-check and place block if empty */
    if (  tx >= 0 && tx < this.width &&
          tz >= 0 && tz < this.depth &&
          ty >= 0 && ty < this.height &&
          this.blocks[tx][tz][ty] === 0 )
    {
        this.blocks[tx][tz][ty] = 1;
        console.log(`Block placed @ (${tx}, ${ty}, ${tz})`);
        // re-render however you normally do it, e.g. renderAllShapes();
    }
  }
  
  removeBlock(camera) {
    /* column directly in front of the player */
    console.log('removeBlock called!');
    const ex = this.worldXtoI(camera.eye.elements[0]);
    const ez = this.worldXtoI(camera.eye.elements[2]);
    const ax = this.worldXtoI(camera.at.elements[0]);
    const az = this.worldXtoI(camera.at.elements[2]);
  
    const tx = ex + Math.sign(ax - ex);
    const tz = ez + Math.sign(az - ez);
    if (tx < 0 || tx >= this.width || tz < 0 || tz >= this.depth) return;
  
    /* 1️⃣ scan downward from the topmost valid layer */
    let ty = this.height - 1;
    while (ty >= 0 && this.blocks[tx][tz][ty] === 0) ty--;
    if (ty < 0) return;            // nothing solid to remove
  
    /* 2️⃣ clear that voxel */
    this.blocks[tx][tz][ty] = 0;

  
    console.log(`Block removed @ (${tx}, ${ty}, ${tz})`);
  }  
}
  
  /* Fisher–Yates shuffle */
  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}


  
  