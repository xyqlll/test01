/**
 * 山海花语 - 自然治愈之旅
 * JavaScript 交互功能
 */

// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // 导航栏滚动效果
    // ========================================
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    // 监听滚动事件，添加毛玻璃效果
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // ========================================
    // 移动端汉堡菜单
    // ========================================
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        
        // 动画效果：汉堡图标变换
        const spans = hamburger.querySelectorAll('span');
        if (navMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
    
    // 点击菜单项后关闭菜单（移动端）
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            const spans = hamburger.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });
    
    // ========================================
    // 平滑滚动动画（淡入效果）
    // ========================================
    const fadeElements = document.querySelectorAll('.fade-in');
    
    // 创建 Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // 可选：只触发一次动画
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // 观察所有需要动画的元素
    fadeElements.forEach(element => {
        observer.observe(element);
    });
    
    // ========================================
    // 卡片悬停增强效果
    // ========================================
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.zIndex = '10';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.zIndex = '1';
        });
    });
    
    // ========================================
    // 时间轴项目悬停效果
    // ========================================
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    timelineItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.zIndex = '10';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.zIndex = '1';
        });
    });
    
    // ========================================
    // 预订表单处理
    // ========================================
    const bookingForm = document.querySelector('.booking-form');
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 获取表单数据
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // 简单验证
            const inputs = this.querySelectorAll('input, select');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#e74c3c';
                } else {
                    input.style.borderColor = '#E0E0E0';
                }
            });
            
            if (isValid) {
                // 模拟提交成功
                alert('感谢您的预订！我们会尽快与您联系。\n\n期待与您在山海间相遇！🌸🌊⛰️');
                this.reset();
            }
        });
        
        // 输入时移除错误样式
        bookingForm.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', function() {
                this.style.borderColor = '#E0E0E0';
            });
        });
    }
    
    // ========================================
    // 导航链接平滑滚动
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80; // 减去导航栏高度
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // ========================================
    // 页面加载完成后的初始动画
    // ========================================
    setTimeout(() => {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.classList.add('visible');
        }
    }, 300);
    
    // ========================================
    // 控制台输出欢迎信息
    // ========================================
    console.log('%c🌸 山海花语 - 自然治愈之旅 🌊', 'font-size: 20px; color: #1A5276; font-weight: bold;');
    console.log('%c期待与您在山海间相遇！', 'font-size: 14px; color: #2E8B57;');
    console.log('%c网站已准备就绪，祝您浏览愉快！', 'font-size: 12px; color: #FFB7B2;');
    
});

// ========================================
// 添加视差滚动效果（可选增强）
// ========================================
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    
    if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
    }
});

// ========================================
// 添加卡片点击动画（移动端优化）
// ========================================
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', function() {
        // 可以在这里添加卡片点击后的行为，如打开详情页面
        console.log('卡片被点击:', this.querySelector('h3').textContent);
    });
});

// ========================================
// 性能优化：防抖函数用于滚动事件
// ========================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 使用防抖优化滚动监听
const optimizedScrollHandler = debounce(function() {
    // 可以在这里添加需要在滚动时执行的优化操作
}, 10);

window.addEventListener('scroll', optimizedScrollHandler);
