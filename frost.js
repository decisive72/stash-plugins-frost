(function () {
    const PluginApi = window.PluginApi;
    const { motion, useAnimation } = window.Motion;
    const React = PluginApi.React;
    const { useCallback } = React;

    const STRENGTH = 0.12;
    const LABEL_STRENGTH = 0.08;

    const MOVE_TRANSITION = { type: "tween", duration: 0.4, ease: [0.33, 1, 0.68, 1] };
    const LEAVE_TRANSITION = { type: "tween", duration: 0.7, ease: [0.33, 1, 0.68, 1] };

    function MagneticNavLink({ children }) {
        const btnControls = useAnimation();
        const labelControls = useAnimation();

        const handleMouseMove = useCallback((e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mapX = ((e.clientX - rect.left) / rect.width - 0.5) * rect.width;
            const mapY = ((e.clientY - rect.top) / rect.height - 0.5) * rect.height;

            btnControls.start({ x: mapX * STRENGTH, y: mapY * STRENGTH, transition: MOVE_TRANSITION });
            labelControls.start({ x: mapX * LABEL_STRENGTH, y: mapY * LABEL_STRENGTH, transition: MOVE_TRANSITION });
        }, [btnControls, labelControls]);

        const handleMouseLeave = useCallback(() => {
            btnControls.start({ x: 0, y: 0, transition: LEAVE_TRANSITION });
            labelControls.start({ x: 0, y: 0, transition: LEAVE_TRANSITION });
        }, [btnControls, labelControls]);

        const navLink = children;
        const linkContainer = React.Children.only(navLink.props.children);
        const button = React.Children.only(linkContainer.props.children);
        const [icon, label] = React.Children.toArray(button.props.children);

        const motionButton = React.createElement(
            motion.a,
            {
                className: button.props.className + " main-nav-menu-item btn",
                animate: btnControls,
                role: "button",
            },
            icon,
            React.createElement(
                motion.span,
                { animate: labelControls },
                label.props.children
            )
        );

        const motionLinkContainer = React.cloneElement(linkContainer, {}, motionButton);

        return React.cloneElement(navLink, {
            onMouseMove: handleMouseMove,
            onMouseLeave: handleMouseLeave,
        }, motionLinkContainer);
    }

    PluginApi.patch.instead("MainNavBar.MenuItems", function (props, _, original) {
        const children = React.Children.map(props.children, (navLink) =>
            React.createElement(MagneticNavLink, { key: navLink.props.eventKey }, navLink)
        );

        return original({ ...props, children });
    });

    PluginApi.patch.instead("MainNavBar.UtilityItems", function (props) {
        return React.createElement(
            "div",
            {
                className: "utility-buttons",
                ref: (el) => {
                    if (!el) return;
                    el.querySelectorAll("a").forEach((a) =>
                        a.setAttribute("tabindex", "-1")
                    );
                },
            },
            props.children
        );
    });
})();
