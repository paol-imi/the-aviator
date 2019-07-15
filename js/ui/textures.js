/* --- Textures data --- */
const texturesData = {
    // colors
    colors: {
        white: 0xd8d0d1,
        pink: 0xF5986E,
        brown: 0x59332e,
        brownDark: 0x23190f,
        red: 'red',

        darkgray: "#515A5A",
        lightgray: "#707B7C"
    }
}

/* --- Textures --- */
// contains all the preloaded geometries/materials and the sprites classes
const Textures = {
    PilotGeometries: {
        bodyGeom: new THREE.BoxGeometry(15, 15, 15),
        faceGeom: new THREE.BoxGeometry(10, 10, 10),
        hairGeom: new THREE.BoxGeometry(4, 4, 4),
        hairSideGeom: new THREE.BoxGeometry(12, 4, 2),
        hairBackGeom: new THREE.BoxGeometry(2, 8, 10),
        glassGeom: new THREE.BoxGeometry(5, 5, 5),
        glassAGeom: new THREE.BoxGeometry(11, 1, 11),
        earGeom: new THREE.BoxGeometry(2, 3, 2)
    },
    PilotMaterials: {
        bodyMat: new THREE.MeshPhongMaterial({
            color: texturesData.colors.brown,
            flatShading: THREE.FlatShading
        }),
        faceMat: new THREE.MeshLambertMaterial({
            color: texturesData.colors.pink
        }),
        hairMat: new THREE.MeshLambertMaterial({
            color: texturesData.colors.brown
        }),
        glassMat: new THREE.MeshLambertMaterial({
            color: texturesData.colors.brown
        })
    },
    // pilot class
    Pilot: class {
        constructor() {
            this.mesh = new THREE.Object3D();
            this.mesh.name = "pilot";
            this.angleHairs = 0;

            var body = new THREE.Mesh(Textures.PilotGeometries.bodyGeom, Textures.PilotMaterials.bodyMat);
            body.position.set(2, -12, 0);
            this.mesh.add(body);

            var face = new THREE.Mesh(Textures.PilotGeometries.faceGeom, Textures.PilotMaterials.faceMat);
            this.mesh.add(face);

            var hair = new THREE.Mesh(Textures.PilotGeometries.hairGeom, Textures.PilotMaterials.hairMat);
            var hairs = new THREE.Object3D();

            this.hairsTop = new THREE.Object3D();

            for (var i = 0; i < 12; i++) {
                var h = hair.clone();
                var col = i % 3;
                var row = Math.floor(i / 3);
                var startPosZ = -4;
                var startPosX = -4;
                h.position.set(startPosX + row * 4, 0, startPosZ + col * 4);
                this.hairsTop.add(h);
            }
            hairs.add(this.hairsTop);

            var hairSideR = new THREE.Mesh(Textures.PilotGeometries.hairSideGeom, Textures.PilotMaterials.hairMat);
            var hairSideL = hairSideR.clone();
            hairSideR.position.set(8, -2, 6);
            hairSideL.position.set(8, -2, -6);
            hairs.add(hairSideR);
            hairs.add(hairSideL);

            var hairBack = new THREE.Mesh(Textures.PilotGeometries.hairBackGeom, Textures.PilotMaterials.hairMat);
            hairBack.position.set(-1, -4, 0)
            hairs.add(hairBack);
            hairs.position.set(-5, 5, 0);

            this.mesh.add(hairs);

            var glassR = new THREE.Mesh(Textures.PilotGeometries.glassGeom, Textures.PilotMaterials.glassMat);
            glassR.position.set(6, 0, 3);
            var glassL = glassR.clone();
            glassL.position.z = -glassR.position.z

            var glassA = new THREE.Mesh(Textures.PilotGeometries.glassAGeom, Textures.PilotMaterials.glassMat);
            this.mesh.add(glassR);
            this.mesh.add(glassL);
            this.mesh.add(glassA);

            var earL = new THREE.Mesh(Textures.PilotGeometries.earGeom, Textures.PilotMaterials.faceMat);
            earL.position.set(0, 0, -6);
            var earR = earL.clone();
            earR.position.set(0, 0, 6);
            this.mesh.add(earL);
            this.mesh.add(earR);
        }

        updateHairs() {
            var hairs = this.hairsTop.children;

            var l = hairs.length;
            for (var i = 0; i < l; i++) {
                var h = hairs[i];
                h.scale.y = .75 + Math.cos(this.angleHairs + i / 3) * .25;
            }
            this.angleHairs += 0.16;
        }
    },
    AirPlaneGeometries: {
        geomCockpit: new THREE.BoxGeometry(80, 50, 50, 1, 1, 1),
        geomEngine: new THREE.BoxGeometry(20, 50, 50, 1, 1, 1),
        geomTailPlane: new THREE.BoxGeometry(15, 20, 5, 1, 1, 1),
        geomSideWing: new THREE.BoxGeometry(30, 5, 120, 1, 1, 1),
        geomWindshield: new THREE.BoxGeometry(3, 15, 20, 1, 1, 1),
        geomPropeller: new THREE.BoxGeometry(20, 10, 10, 1, 1, 1),
        geomBlade: new THREE.BoxGeometry(1, 80, 10, 1, 1, 1),
        wheelProtecGeom: new THREE.BoxGeometry(30, 15, 10, 1, 1, 1),
        wheelTireGeom: new THREE.BoxGeometry(24, 24, 4),
        wheelAxisGeom: new THREE.BoxGeometry(10, 10, 6),
        suspensionGeom: new THREE.BoxGeometry(4, 20, 4),
        popUpGeom: new THREE.CircleGeometry(12, 32),
        popUpBorderGeom: new THREE.CircleGeometry(15, 32)
    },
    AirPlaneMaterials: {
        matCockpit: new THREE.MeshPhongMaterial({
            color: texturesData.colors.red,
            flatShading: THREE.FlatShading
        }),
        matEngine: new THREE.MeshPhongMaterial({
            color: texturesData.colors.white,
            flatShading: THREE.FlatShading
        }),
        matTailPlane: new THREE.MeshPhongMaterial({
            color: texturesData.colors.red,
            flatShading: THREE.FlatShading
        }),
        matSideWing: new THREE.MeshPhongMaterial({
            color: texturesData.colors.red,
            flatShading: THREE.FlatShading
        }),
        matWindshield: new THREE.MeshPhongMaterial({
            color: texturesData.colors.white,
            transparent: true,
            opacity: .3,
            flatShading: THREE.FlatShading
        }),
        matPropeller: new THREE.MeshPhongMaterial({
            color: texturesData.colors.brown,
            flatShading: THREE.FlatShading
        }),
        matBlade: new THREE.MeshPhongMaterial({
            color: texturesData.colors.brownDark,
            flatShading: THREE.FlatShading
        }),
        wheelProtecMat: new THREE.MeshPhongMaterial({
            color: texturesData.colors.red,
            flatShading: THREE.FlatShading
        }),
        wheelTireMat: new THREE.MeshPhongMaterial({
            color: texturesData.colors.brownDark,
            flatShading: THREE.FlatShading
        }),
        wheelAxisMat: new THREE.MeshPhongMaterial({
            color: texturesData.colors.brown,
            flatShading: THREE.FlatShading
        }),
        suspensionMat: new THREE.MeshPhongMaterial({
            color: texturesData.colors.red,
            flatShading: THREE.FlatShading
        })
    },
    // airPlane class
    AirPlane: class {
        constructor() {
            this.blocks = []

            this.mesh = new THREE.Object3D();
            this.mesh.name = "airPlane";

            var cockpit = new THREE.Mesh(Textures.AirPlaneGeometries.geomCockpit, Textures.AirPlaneMaterials.matCockpit);
            cockpit.castShadow = true;
            cockpit.receiveShadow = true;
            this.mesh.add(cockpit);

            // Engine
            var engine = new THREE.Mesh(Textures.AirPlaneGeometries.geomEngine, Textures.AirPlaneMaterials.matEngine);
            engine.position.x = 50;
            engine.castShadow = true;
            engine.receiveShadow = true;
            this.mesh.add(engine);

            // Tail Plane
            var tailPlane = new THREE.Mesh(Textures.AirPlaneGeometries.geomTailPlane, Textures.AirPlaneMaterials.matTailPlane);
            tailPlane.position.set(-40, 20, 0);
            tailPlane.castShadow = true;
            tailPlane.receiveShadow = true;
            this.mesh.add(tailPlane);

            // Wings
            var sideWing = new THREE.Mesh(Textures.AirPlaneGeometries.geomSideWing, Textures.AirPlaneMaterials.matSideWing);
            sideWing.position.set(0, 15, 0);
            sideWing.castShadow = true;
            sideWing.receiveShadow = true;
            this.mesh.add(sideWing);

            var windshield = new THREE.Mesh(Textures.AirPlaneGeometries.geomWindshield, Textures.AirPlaneMaterials.matWindshield);
            windshield.position.set(5, 27, 0);
            windshield.castShadow = true;
            windshield.receiveShadow = true;
            this.mesh.add(windshield);

            this.propeller = new THREE.Mesh(Textures.AirPlaneGeometries.geomPropeller, Textures.AirPlaneMaterials.matPropeller);

            this.propeller.castShadow = true;
            this.propeller.receiveShadow = true;

            var blade1 = new THREE.Mesh(Textures.AirPlaneGeometries.geomBlade, Textures.AirPlaneMaterials.matBlade);
            blade1.position.set(8, 0, 0);

            blade1.castShadow = true;
            blade1.receiveShadow = true;

            var blade2 = blade1.clone();
            blade2.rotation.x = Math.PI / 2;

            blade2.castShadow = true;
            blade2.receiveShadow = true;

            this.propeller.add(blade1);
            this.propeller.add(blade2);
            this.propeller.position.set(60, 0, 0);
            this.mesh.add(this.propeller);

            var wheelProtecR = new THREE.Mesh(Textures.AirPlaneGeometries.wheelProtecGeom, Textures.AirPlaneMaterials.wheelProtecMat);
            wheelProtecR.position.set(25, -20, 25);
            this.mesh.add(wheelProtecR);

            var wheelTireR = new THREE.Mesh(Textures.AirPlaneGeometries.wheelTireGeom, Textures.AirPlaneMaterials.wheelTireMat);
            wheelTireR.position.set(25, -28, 25);

            var wheelAxis = new THREE.Mesh(Textures.AirPlaneGeometries.wheelAxisGeom, Textures.AirPlaneMaterials.wheelAxisMat);
            wheelTireR.add(wheelAxis);
            this.mesh.add(wheelTireR);

            var wheelProtecL = wheelProtecR.clone();
            wheelProtecL.position.z = -wheelProtecR.position.z;
            this.mesh.add(wheelProtecL);

            var wheelTireL = wheelTireR.clone();
            wheelTireL.position.z = -wheelTireR.position.z;
            this.mesh.add(wheelTireL);

            var wheelTireB = wheelTireR.clone();
            wheelTireB.scale.set(.5, .5, .5);
            wheelTireB.position.set(-35, -5, 0);
            this.mesh.add(wheelTireB);

            var suspension = new THREE.Mesh(Textures.AirPlaneGeometries.suspensionGeom, Textures.AirPlaneMaterials.suspensionMat);
            suspension.position.set(-35, -5, 0);
            suspension.rotation.z = -.3;
            this.mesh.add(suspension);

            this.pilot = new Textures.Pilot();
            this.pilot.mesh.position.set(-10, 27, 0);
            this.mesh.add(this.pilot.mesh);

            this.mesh.castShadow = true;
            this.mesh.receiveShadow = true;

            var popUp = new THREE.Mesh(Textures.AirPlaneGeometries.popUpGeom, new THREE.MeshBasicMaterial({
                color: 0xffff00
            }))
            var border = new THREE.Mesh(Textures.AirPlaneGeometries.popUpBorderGeom, new THREE.MeshBasicMaterial({
                color: 0x23190f
            }))
            popUp.add(border)
            border.position.set(0, 0, -1)
            popUp.position.set(0, 40, 0)
            this.mesh.add(popUp)
            this.popUp = popUp
            popUp.scale.set(0.01, 0.01, 0.01)
            popUp.visible = false
        }

        updatePropeller() {
            this.propeller.rotation.x += 0.3;
        }

        setBlock(mesh) {
            this.popBlock()
            this.block = mesh
            this.mesh.add(mesh)
        }

        popBlock() {
            if (this.block) {
                this.mesh.remove(this.block)
                let block = this.block
                this.block = undefined
                return block
            }
        }

        static setColor(color) {
            ['matCockpit', 'matTailPlane', 'matSideWing', 'wheelProtecMat', 'suspensionMat']
                .forEach(value => Textures.AirPlaneMaterials[value].color.set(color))
        }
    },
    CellGeometries: {
        geometry: new THREE.BoxBufferGeometry(108, 4, 108)
    },
    CellMaterials: {
        mat1: new THREE.MeshPhongMaterial({
            color: texturesData.colors.darkgray
        }),
        mat2: new THREE.MeshPhongMaterial({
            color: texturesData.colors.lightgray
        }),
    },
    // cell class
    Cell: class {
        constructor(type) {
            this.mesh = new THREE.Mesh(Textures.CellGeometries.geometry, type == 1 ? Textures.CellMaterials.mat1 : Textures.CellMaterials.mat2)
            this.mesh.receiveShadow = true
        }
    },
    BlockGeometries: {
        geometry: new THREE.BoxGeometry(52, 52, 52)
    },
    BlockMaterials: {
        'translucent': {
            transparent: true,
            opacity: 0.5
        }
    },
    // block class
    Block: class {
        constructor(color, translucent) {
            const material = new THREE.MeshPhongMaterial(translucent ? Textures.BlockMaterials['translucent'] : {})
            material.color.set(color)

            this.mesh = new THREE.Mesh(Textures.BlockGeometries.geometry, material)
            this.mesh.receiveShadow = true
            this.mesh.castShadow = !translucent
        }
    },
    // load some setting
    load: function () {
        Textures.PilotGeometries.hairGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 2, 0));
        Textures.PilotGeometries.hairSideGeom.applyMatrix(new THREE.Matrix4().makeTranslation(-6, 0, 0));

        Textures.AirPlaneGeometries.geomCockpit.vertices[4].y -= 10;
        Textures.AirPlaneGeometries.geomCockpit.vertices[4].z += 20;
        Textures.AirPlaneGeometries.geomCockpit.vertices[5].y -= 10;
        Textures.AirPlaneGeometries.geomCockpit.vertices[5].z -= 20;
        Textures.AirPlaneGeometries.geomCockpit.vertices[6].y += 30;
        Textures.AirPlaneGeometries.geomCockpit.vertices[6].z += 20;
        Textures.AirPlaneGeometries.geomCockpit.vertices[7].y += 30;
        Textures.AirPlaneGeometries.geomCockpit.vertices[7].z -= 20;

        Textures.AirPlaneGeometries.geomPropeller.vertices[4].y -= 5;
        Textures.AirPlaneGeometries.geomPropeller.vertices[4].z += 5;
        Textures.AirPlaneGeometries.geomPropeller.vertices[5].y -= 5;
        Textures.AirPlaneGeometries.geomPropeller.vertices[5].z -= 5;
        Textures.AirPlaneGeometries.geomPropeller.vertices[6].y += 5;
        Textures.AirPlaneGeometries.geomPropeller.vertices[6].z += 5;
        Textures.AirPlaneGeometries.geomPropeller.vertices[7].y += 5;
        Textures.AirPlaneGeometries.geomPropeller.vertices[7].z -= 5;

        Textures.AirPlaneGeometries.suspensionGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 10, 0))

        Textures.BlockGeometries.edges = new THREE.EdgesGeometry(Textures.BlockGeometries.geometry)
    }
}