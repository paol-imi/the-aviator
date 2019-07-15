/* --- Three --- */
// The Three object manage the THREE components (scene, camera, lights...)
const Three = { 
    // load components in a given container
    load: container => {
        // components
        var scene,
            camera, cameraSetting = {
                fieldOfView: 60,
                nearPlane: 1,
                farPlane: 10000,
                x: -252,
                z: -582,
                y: 630
            },
            controls,
            renderer

        // create the scene
        function createScene() {
            scene = new THREE.Scene();

            camera = new THREE.PerspectiveCamera(
                cameraSetting.fieldOfView,
                container.offsetWidth / container.offsetHeight,
                cameraSetting.nearPlane,
                cameraSetting.farPlane
            );
            camera.position.set(cameraSetting.x, cameraSetting.y, cameraSetting.z) //-30, 35, 0
            camera.lookAt(scene.position)

            renderer = new THREE.WebGLRenderer({
                alpha: true,
                antialias: true
            });
            renderer.setSize(container.offsetWidth, container.offsetHeight);
            renderer.shadowMap.enabled = true;
            renderer.render(scene, camera);
            container.appendChild(renderer.domElement);

            controls = new THREE.OrbitControls(camera, renderer.domElement)
            controls.maxPolarAngle = Math.PI / 2.5
            controls.update()
        }

        // resize the canvas
        function handleWindowResize() {
            height = container.offsetHeight;
            width = container.offsetWidth;

            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }

        // lights
        var ambientLight, al = {
            color: 0xdc8874,
            intensity: .6
        },
        hemisphereLight, hl = {
            skyColor: 0xaaaaaa,
            groundColor: 0x000000,
            intensity: .9
        },
        shadowLight, sl = {
            color: 0xffffff,
                intensity: .7,
                castShadow: true,
                x: 0,
                y: 1,
                z: 0,
                left: -400,
                right: 400,
                top: 400,
                bottom: -400,
                near: 1,
                far: 1000,
                width: 2048,
                height: 2048
            };

        // create the lights
        function createLights() {
            hemisphereLight = new THREE.HemisphereLight(hl.skyColor, hl.groundColor, hl.intensity);

            ambientLight = new THREE.AmbientLight(al.color, al.intensity);

            shadowLight = new THREE.DirectionalLight(sl.color, sl.intensity);
            shadowLight.position.set(150, 350, 350);
            shadowLight.castShadow = sl.castShadow;
            shadowLight.shadow.camera.left = sl.left;
            shadowLight.shadow.camera.right = sl.right;
            shadowLight.shadow.camera.top = sl.top;
            shadowLight.shadow.camera.bottom = sl.bottom;
            shadowLight.shadow.camera.near = sl.near;
            shadowLight.shadow.camera.far = sl.far;
            shadowLight.shadow.mapSize.width = sl.width;
            shadowLight.shadow.mapSize.height = sl.height;

            scene.add(hemisphereLight);
            scene.add(shadowLight);
            scene.add(ambientLight);
        }

        // set the hemisphereLight color
        function setLightColor(color) {
            hemisphereLight.color = new THREE.Color(color)
        }

        // render the scene
        function render() {
            renderer.render(scene, camera)
        }

        // clear all elements excepts the lights
        function clear() {
            for (let i = scene.children.length - 1; i >= 0; i--) {
                let mesh = scene.children[i]
                if (!mesh.type.includes('Light'))
                    scene.remove(mesh)
            }

            //camera.lookAt(0, 0, 0)
        }

        createScene()
        createLights()

        // add listeners
        window.addEventListener('resize', handleWindowResize, false)
        window.addEventListener('load', handleWindowResize, false)

        Object.assign(Three, {
            scene,
            camera,
            render,
            controls,
            clear,
            handleWindowResize
        })
    }
}